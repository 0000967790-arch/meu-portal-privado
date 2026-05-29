import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cpfToEmail = (cpf: string) => `${cpf}@associado.toptruck.app`;

// Public: check whether an email belongs to an active associate (used by login)
export const checkAssociateByEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email().max(255) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("associates")
      .select("id, active")
      .ilike("email", data.email)
      .maybeSingle();
    return { exists: !!row, active: row?.active ?? false };
  });

// Authenticated: returns the associate record for the current user
export const getMyAssociate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, claims } = context;
    const email = (claims as { email?: string }).email ?? "";
    const { data } = await supabase
      .from("associates")
      .select("id, full_name, email, phone, card_number, active, created_at")
      .or(`user_id.eq.${context.userId},email.ilike.${email}`)
      .maybeSingle();
    return { associate: data ?? null };
  });

// Authenticated: returns whether current user is admin
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

// Admin only: list all associates
export const listAssociates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado");

    const { data, error } = await supabaseAdmin
      .from("associates")
      .select("id, full_name, email, phone, card_number, active, created_at, user_id, cpf, placa")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { associates: data ?? [] };
  });

const createSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  placa: z.string().trim().regex(/^[A-Za-z0-9]{7}$/, "Placa deve ter 7 caracteres").transform((v) => v.toUpperCase()),
});

export const createAssociate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado");

    const email = cpfToEmail(data.cpf);

    // Verificar se CPF já está cadastrado
    const { data: existing } = await supabaseAdmin
      .from("associates")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing) throw new Error("CPF já cadastrado no sistema");

    // Inserir associado na tabela
    const { data: inserted, error } = await supabaseAdmin
      .from("associates")
      .insert({
        full_name: data.full_name,
        email,
        phone: data.phone || null,
        cpf: data.cpf,
        placa: data.placa,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Criar conta de autenticação para o associado (senha = placa)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.placa,
      email_confirm: true,
    });

    if (authError && !authError.message.includes("already registered")) {
      // Se falhar ao criar o auth user, remove o registro da tabela
      await supabaseAdmin.from("associates").delete().eq("id", inserted.id);
      throw new Error(`Erro ao criar acesso: ${authError.message}`);
    }

    // Vincular user_id ao associado
    if (authUser?.user?.id) {
      await supabaseAdmin
        .from("associates")
        .update({ user_id: authUser.user.id })
        .eq("id", inserted.id);
    }

    return { associate: inserted };
  });

export const setAssociateActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado");
    const { error } = await supabaseAdmin
      .from("associates")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAssociate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado");

    // Buscar email para remover também do auth
    const { data: assoc } = await supabaseAdmin
      .from("associates")
      .select("email, user_id")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("associates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    // Remover usuário do auth se existir
    if (assoc?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(assoc.user_id);
    }

    return { ok: true };
  });

// Admin only: update associate placa (senha)
export const updateAssociatePlaca = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      placa: z.string().trim().regex(/^[A-Za-z0-9]{7}$/, "Placa deve ter 7 caracteres").transform((v) => v.toUpperCase()),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso negado");

    // Atualizar placa na tabela
    const { data: assoc, error } = await supabaseAdmin
      .from("associates")
      .update({ placa: data.placa })
      .eq("id", data.id)
      .select("user_id, email")
      .single();
    if (error) throw new Error(error.message);

    // Atualizar senha no auth
    if (assoc?.user_id) {
      await supabaseAdmin.auth.admin.updateUserById(assoc.user_id, {
        password: data.placa,
      });
    }

    return { ok: true };
  });
