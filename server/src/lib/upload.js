const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { convertToWebp } = require("./webp");
const { randomUUID } = require("node:crypto");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Files are held in memory just long enough to stream to Cloudinary — never
// written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: function (req, file, cb) {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(Object.assign(new Error("Only JPG, PNG or WebP files are allowed."), { status: 400 }));
    }
    cb(null, true);
  }
});

// Streams a multer in-memory file buffer up to Cloudinary and resolves with
// its secure (https) URL.
function storeWebp(converted, folder, options = {}) {
  return new Promise(function (resolve, reject) {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: randomUUID(), ...options, folder, resource_type: "image", format: "webp", allowed_formats: ["webp"], overwrite: false },
      function (err, result) {
        if (err) return reject(err);
        if (result.format !== "webp" || !result.secure_url?.startsWith("https://")) return reject(new Error("Image storage returned an invalid format."));
        resolve(result);
      }
    );
    stream.end(converted.buffer);
  });
}

async function uploadToCloudinary(file, folder, options = {}) {
  const result = await storeWebp(await convertToWebp(file.buffer), folder, options);
  return result.secure_url;
}

module.exports = { upload, uploadToCloudinary, storeWebp };
