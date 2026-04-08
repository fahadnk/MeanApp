// Import the multer library (used for handling file uploads in Node.js / Express)
import multer from 'multer';

// Configure storage to use memory instead of saving files to disk
const storage = multer.memoryStorage();   // ← Files will be stored in RAM as buffers

// Define a file filter function to allow only specific file types
const fileFilter = (req, file, cb) => {

  // Regular expression to match allowed image formats
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  // Check if the uploaded file's MIME type matches allowed formats
  if (allowedTypes.test(file.mimetype)) {

    // Accept the file (no error, true = allowed)
    cb(null, true);

  } else {

    // Reject the file with an error message
    cb(new Error('Only images allowed!'), false);
  }
};

// Create the multer upload instance with custom configuration
const upload = multer({

  // Use memory storage (files won't be saved to disk)
  storage: storage,

  // Set file size limit to 5MB
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB in bytes

  // Apply the custom file filter function
  fileFilter: fileFilter
});

// Export the configured upload middleware for use in routes
export default upload;