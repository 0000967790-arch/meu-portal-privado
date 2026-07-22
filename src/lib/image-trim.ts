/**
 * Trims near-white / transparent borders around a logo image and returns a
 * square PNG File centered on the actual logo, with a small transparent margin.
 * This way we standardize partner logos regardless of how much white padding
 * the original file has around the mark.
 */
export async function trimLogoToSquarePng(file: File, options?: {
  threshold?: number;   // 0-255: pixels brighter than this (and opaque) count as background
  paddingRatio?: number; // extra transparent padding around the logo (fraction of side)
  outputSize?: number;   // final square size in px
}): Promise<File> {
  const threshold = options?.threshold ?? 240;
  const paddingRatio = options?.paddingRatio ?? 0.08;
  const outputSize = options?.outputSize ?? 512;

  const bitmap = await loadBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;

  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) return file;
  sctx.drawImage(bitmap, 0, 0);

  let data: Uint8ClampedArray;
  try {
    data = sctx.getImageData(0, 0, w, h).data;
  } catch {
    // CORS-tainted (e.g. remote URL) — return original
    return file;
  }

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a < 10) continue; // transparent = background
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // near-white = background
      if (r >= threshold && g >= threshold && b >= threshold) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0 || maxY < 0) return file; // couldn't detect content

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const side = Math.max(cropW, cropH);
  const pad = Math.round(side * paddingRatio);
  const canvasSide = side + pad * 2;

  const out = document.createElement("canvas");
  out.width = outputSize;
  out.height = outputSize;
  const octx = out.getContext("2d");
  if (!octx) return file;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";

  const scale = outputSize / canvasSide;
  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const dx = (outputSize - drawW) / 2;
  const dy = (outputSize - drawH) / 2;

  octx.drawImage(src, minX, minY, cropW, cropH, dx, dy, drawW, drawH);

  const blob: Blob | null = await new Promise((res) => out.toBlob(res, "image/png"));
  if (!blob) return file;
  const baseName = (file.name.split(".").slice(0, -1).join(".") || "logo") + ".png";
  return new File([blob], baseName, { type: "image/png" });
}

async function loadBitmap(file: File): Promise<HTMLImageElement | ImageBitmap> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> loader
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // Revoked after draw would break some browsers; safe to revoke soon after
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
