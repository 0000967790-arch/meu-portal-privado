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
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("associates")
      .select("id, full_name, email, phone, cpf, placa, card_number, active, created_at")
      .eq("user_id", userId)
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
      .select("id, full_name, email, phone, card_number, active, created_at, user_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { associates: data ?? [] };
  });

const createSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  placa: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{7}$/, "Placa deve ter 7 caracteres"),
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

    // Pre-create the auth user with placa as password so the associate
    // can log in imediatamente com o CPF e a placa cadastrada pelo admin.
    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.placa,
      email_confirm: true,
    });
    if (authError && !/already|registered|exists/i.test(authError.message)) {
      throw new Error(authError.message);
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("associates")
      .insert({
        full_name: data.full_name,
        email,
        phone: data.phone || null,
        user_id: created?.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
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
    const { error } = await supabaseAdmin.from("associates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
