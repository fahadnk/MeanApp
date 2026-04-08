// Import multer (middleware for handling file uploads)
import multer from 'multer';

// Import path module (helps handle file paths)
import path from 'path';

// Import function to get current file path in ES modules
import { fileURLToPath } from 'url';

// Convert import.meta.url to actual file path
const __filename = fileURLToPath(import.meta.url);

// Get directory name from file path
const __dirname = path.dirname(__filename);

// Configure storage settings for multer
// We can use const storage = new GridFsStorage({ ... }) if we want to store files in MongoDB instead of local filesystem
const storage = multer.diskStorage({

  // Set destination folder where files will be saved
  destination: (req, file, cb) => {
    // Save files inside uploads/profile folder
    cb(null, path.join(__dirname, '../../uploads/profile'));
  },

  // Set filename for uploaded files
  filename: (req, file, cb) => {
    // Create a unique suffix using timestamp + random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Create filename: profile-userId-uniqueSuffix.extension
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {

  // Allowed file extensions
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  // Check file extension (like .jpg, .png)
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  // Check MIME type (like image/jpeg, image/png)
  const mimetype = allowedTypes.test(file.mimetype);

  // If both extension and MIME type are valid → accept file
  if (extname && mimetype) {
    return cb(null, true);
  }

  // Otherwise reject file with error
  cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
};

// Create multer upload instance with configuration
const upload = multer({

  // Use defined storage configuration
  storage: storage,

  // Limit file size to 5MB
  limits: { fileSize: 5 * 1024 * 1024 },

  // Apply file filter
  fileFilter: fileFilter
});

// Export upload middleware to use in routes
export default upload;