const sharp = require("sharp");
const { createHash } = require("node:crypto");

// Decode real pixels, strip metadata, orient phone photos, and bound memory/output size.
async function convertToWebp(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > 5 * 1024 * 1024) {
    throw Object.assign(new Error("Choose a JPG, PNG or WebP image up to 5 MB."), { status: 400 });
  }
  try {
    const input = sharp(buffer, { limitInputPixels: 36_000_000, failOn: "error" });
    const metadata = await input.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error("Unsupported image");
    const { data, info } = await input.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height, bytes: data.length, hash: createHash("sha256").update(data).digest("hex") };
  } catch {
    throw Object.assign(new Error("This image could not be read. Use a still JPG, PNG or WebP under 36 megapixels."), { status: 400 });
  }
}
module.exports = { convertToWebp };
