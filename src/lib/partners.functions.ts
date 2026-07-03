import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const partnerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  discount: z.string().trim().max(120).optional().or(z.literal("")),
  benefit: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  hours: z.string().trim().max(120).optional().or(z.literal("")),
  services: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  logo_url: z.string().trim().max(1000).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

async function assertAdmin(context: { supabase: ReturnType<typeof supabaseAdmin.from> extends never ? never : any; userId: string }) {
  const { data } = await (context.supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado");
}

export const listPartners = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("partners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return { partners: data ?? [] };
});

export const listPartnersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { data, error } = await supabaseAdmin
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { partners: data ?? [] };
  });

export const createPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => partnerSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const payload = {
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      discount: data.discount || null,
      benefit: data.benefit || null,
      address: data.address || null,
      phone: data.phone || null,
      website: data.website || null,
      hours: data.hours || null,
      services: data.services,
      logo_url: data.logo_url || null,
      active: data.active,
      sort_order: data.sort_order,
    };
    const { data: row, error } = await supabaseAdmin
      .from("partners")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { partner: row };
  });

export const updatePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), values: partnerSchema.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const v = data.values;
    const payload: Record<string, unknown> = {};
    const putStr = (k: keyof typeof v) => {
      if (v[k] !== undefined) payload[k as string] = (v[k] as string) || null;
    };
    (["name", "category", "description", "discount", "benefit", "address", "phone", "website", "hours", "logo_url"] as const).forEach(putStr);
    if (v.services !== undefined) payload.services = v.services;
    if (v.active !== undefined) payload.active = v.active;
    if (v.sort_order !== undefined) payload.sort_order = v.sort_order;
    const { error } = await supabaseAdmin.from("partners").update(payload as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { error } = await supabaseAdmin.from("partners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
