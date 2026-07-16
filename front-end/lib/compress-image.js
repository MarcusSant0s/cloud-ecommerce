// Downscale + re-encode an image File in the browser before upload, so the client
// sends far fewer bytes and the origin (S3) stores reasonably-sized assets. Returns a
// new File; on any failure — or if compression doesn't actually shrink the file — the
// original File is returned unchanged, so callers can use the result unconditionally.
export async function compressImage(file, { maxDim = 1600, quality = 0.82 } = {}) {
  // Only raster images. Leave anything else (e.g. SVG) alone.
  if (!file || !file.type?.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    // `from-image` bakes EXIF orientation into the pixels so phone photos aren't rotated.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.round(bitmap.width * scale);
    const targetH = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );

    // Encoding failed or produced a larger file — keep the original.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^./\\]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
}
