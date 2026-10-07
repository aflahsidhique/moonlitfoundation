const multer = require("multer");
const { uploadToCloudinary } = require("./upload");
const types = new Set(["image/jpeg", "image/png", "image/webp"]);
const parser = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, next) => next(types.has(file.mimetype) ? null : Object.assign(new Error("Choose a JPG, PNG or WebP image."), { status: 400 }), types.has(file.mimetype)) }).single("image");

function validImage(file) {
  const buffer = file.buffer;
  if (file.mimetype === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return file.mimetype === "image/webp" && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
}

function parseEventImage(req, res, next) {
  parser(req, res, (error) => {
    if (error) return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 5 MB." : "Upload one JPG, PNG or WebP image." });
    if (!req.file || !validImage(req.file)) return res.status(400).json({ error: "Choose a valid JPG, PNG or WebP image." });
    next();
  });
}

async function storeEventImage(file) {
  if (!["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((key) => process.env[key] && !process.env[key].startsWith("your-"))) throw Object.assign(new Error("Image uploads are not configured. Add Cloudinary credentials on the server."), { status: 503 });
  try { return await uploadToCloudinary(file, "moonlit/events", { allowed_formats: ["jpg", "jpeg", "png", "webp"] }); }
  catch { throw Object.assign(new Error("The image could not be uploaded. Please try again."), { status: 502 }); }
}

function isStoredEventImage(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && /\/image\/upload\/(?:[^/]+\/)*moonlit\/events\//.test(url.pathname);
  } catch { return false; }
}

module.exports = { parseEventImage, storeEventImage, validImage, isStoredEventImage };
