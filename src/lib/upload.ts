import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to a private Supabase Storage bucket and returns a long-lived
 * signed URL that can be stored in the database and used in <img src>.
 * Requires the caller to have admin RLS access to the bucket.
 */
export async function uploadImageAndGetUrl(bucket: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message);
  // 10 years — effectively permanent for our purposes
  const { data, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !data) throw new Error(signErr?.message || "Falha ao gerar URL da imagem");
  return data.signedUrl;
}
