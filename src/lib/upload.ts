import { supabase } from "@/integrations/supabase/client";

/**
 * Detects the real content of a logo (non-white, non-transparent pixels) and
 * crops the image to that bounding box, removing surrounding white background.
 * Returns a trimmed PNG File; falls back to the original file on any failure
 * or when no content is detected.
 */
export async function trimLogoFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const src = document.createElement("canvas");
    src.width = bitmap.width;
    src.height = bitmap.height;
    const sctx = src.getContext("2d");
    if (!sctx) return file;
    sctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const { data, width, height } = sctx.getImageData(0, 0, src.width, src.height);
    const threshold = 245;
    let minX = width, minY = height, maxX = -1, maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const a = data[i + 3];
        if (a <= 16) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r >= threshold && g >= threshold && b >= threshold) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < 0 || maxY < 0) return file; // imagem toda branca/transparente

    const pad = Math.round(Math.max(width, height) * 0.03);
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    if (cropW >= width - 4 && cropH >= height - 4) return file; // nada a cortar

    const out = document.createElement("canvas");
    out.width = cropW;
    out.height = cropH;
    const octx = out.getContext("2d");
    if (!octx) return file;
    octx.drawImage(src, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" });
  } catch {
    return file;
  }
}

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
