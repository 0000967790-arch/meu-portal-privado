import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const imageSchema = z.object({
  image_url: z.string().trim().min(4).max(1000),
  alt_text: z.string().trim().max(200).default(""),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado");
}

export const listCarouselImages = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("carousel_images")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return { images: data ?? [] };
});

export const listCarouselImagesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { data, error } = await supabaseAdmin
      .from("carousel_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { images: data ?? [] };
  });

export const createCarouselImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => imageSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { data: row, error } = await supabaseAdmin
      .from("carousel_images")
      .insert({
        image_url: data.image_url,
        alt_text: data.alt_text,
        active: data.active,
        sort_order: data.sort_order,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { image: row };
  });

export const updateCarouselImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), values: imageSchema.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { error } = await supabaseAdmin
      .from("carousel_images")
      .update(data.values as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCarouselImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { error } = await supabaseAdmin
      .from("carousel_images")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
