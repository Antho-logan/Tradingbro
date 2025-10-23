// Server-side image shrinking using Sharp
export async function shrinkImageServer(
  buffer: Buffer,
  maxWidth = 1200,
  quality = 80
): Promise<Buffer> {
  try {
    // Use sharp for server-side image processing
    const sharp = await import('sharp').then(m => m.default);
    return await sharp(buffer)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  } catch (error) {
    // Fallback: return original buffer if sharp is not available
    console.warn('[image-utils-server] Sharp not available, returning original image');
    return buffer;
  }
}