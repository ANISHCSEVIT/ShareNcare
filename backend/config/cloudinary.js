import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path'; // Import the path module
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sharencare_uploads',
        resource_type: 'auto',
        allowed_formats: ['jpeg', 'png', 'jpg', 'pdf'],
    },
    // **THE FIX IS HERE**: This function ensures the file extension is kept
    filename: function (req, file, cb) {
        // Use the original file name's extension (like '.pdf')
        const extension = path.extname(file.originalname);
        // Create a unique filename but keep the original extension
        cb(null, file.fieldname + '-' + Date.now() + extension);
  }
});

export default storage;
