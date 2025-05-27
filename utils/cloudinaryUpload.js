const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = (fileBuffer, folder = 'communities') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
