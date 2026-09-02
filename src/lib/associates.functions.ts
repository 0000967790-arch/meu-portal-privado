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

// Public: validate a CPF/CNPJ + placa pair against the associate's registered
// plates and align the auth password with the plate used to log in.
export const resolveAssociateLogin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        cpf: z.string().regex(/^(\d{11}|\d{14})$/),
        placa: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{7}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const email = cpfToEmail(data.cpf);
    const { data: row } = await supabaseAdmin
      .from("associates")
      .select("id, active, user_id, placa, placas")
      .ilike("email", email)
      .maybeSingle();
    if (!row) return { exists: false, active: false, plateValid: false };
    if (!row.active) return { exists: true, active: false, plateValid: false };

    const known = new Set<string>([...(row.placas ?? []), row.placa].filter(Boolean) as string[]);
    if (!known.has(data.placa)) return { exists: true, active: true, plateValid: false };

    // Align the auth user password with the plate being used
    if (row.user_id) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
        password: data.placa,
      });
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.placa,
        email_confirm: true,
      });
      if (error && !/already|registered|exists/i.test(error.message)) throw new Error(error.message);
      if (created?.user?.id) {
        await supabaseAdmin.from("associates").update({ user_id: created.user.id }).eq("id", row.id);
      }
    }
    await supabaseAdmin.from("associates").update({ placa: data.placa }).eq("id", row.id);
    return { exists: true, active: true, plateValid: true };
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
      .select("id, full_name, email, phone, card_number, active, created_at, user_id, placa, placas")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { associates: data ?? [] };
  });

const plateSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{7}$/, "Placa deve ter 7 caracteres");

const createSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  cpf: z.string().regex(/^(\d{11}|\d{14})$/, "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  placa: plateSchema.optional(),
  placas: z.array(plateSchema).min(1, "Informe ao menos uma placa").max(50).optional(),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: roleRow } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) throw new Error("Acesso negado");
}

export const createAssociate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const plates = Array.from(
      new Set([...(data.placas ?? []), ...(data.placa ? [data.placa] : [])]),
    );
    if (plates.length === 0) throw new Error("Informe ao menos uma placa");

    const email = cpfToEmail(data.cpf);

    // Existing document? just merge the new plates into it
    const { data: existing } = await supabaseAdmin
      .from("associates")
      .select("id, placa, placas")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      const merged = Array.from(
        new Set([...(existing.placas ?? []), ...(existing.placa ? [existing.placa] : []), ...plates]),
      );
      const { data: updated, error } = await supabaseAdmin
        .from("associates")
        .update({ placas: merged, full_name: data.full_name, phone: data.phone || null })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { associate: updated, merged: true };
    }

    // Pre-create the auth user with the first placa as password so the associate
    // can log in imediatamente com o CPF/CNPJ e qualquer placa cadastrada.
    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: plates[0],
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
        cpf: data.cpf,
        placa: plates[0],
        placas: plates,
        user_id: created?.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { associate: inserted, merged: false };
  });

// Admin: replace the plate list of an associate
export const updateAssociatePlates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), placas: z.array(plateSchema).min(1).max(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const plates = Array.from(new Set(data.placas));
    const { error } = await supabaseAdmin
      .from("associates")
      .update({ placas: plates, placa: plates[0] })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, placas: plates };
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
