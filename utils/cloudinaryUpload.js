const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

/**
 * Uploads a file buffer to Cloudinary, supporting both images and videos.
 * @param {Buffer} buffer - The file buffer to upload.
 * @param {string} mimetype - The MIME type (e.g., 'image/jpeg', 'video/mp4').
 * @returns {Promise<Object>} - The Cloudinary upload result.
 */
const uploadToCloudinary = async (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: mimetype.startsWith("video") ? "video" : "image",
      },
      (error, result) => {
        if (error) {
          reject(new Error("Cloudinary upload failed: " + error.message));
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;
