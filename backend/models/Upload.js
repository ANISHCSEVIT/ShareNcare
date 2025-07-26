import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  companyID: { 
    type: String, 
    required: true,
    index: true
  },
  candidateID: { 
    type: String, 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true 
  }, // e.g., 'aadhar', 'pan', 'pdf', etc.
  filename: { 
    type: String, 
    required: true 
  }, // This will be the Cloudinary public_id
  resourceType: { 
    type: String, 
    required: true,
    enum: ['image', 'raw', 'video', 'auto'],
    default: 'image' // Default to image since that's how your files are stored
  },
  originalName: { 
    type: String 
  }, // Store original filename for better UX
  mimetype: { 
    type: String 
  }, // Store mimetype for additional validation
  timestamp: { 
    type: String, 
    default: () => new Date().toISOString() 
  },
  verified: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add compound index for better query performance
uploadSchema.index({ candidateID: 1, type: 1 });
uploadSchema.index({ companyID: 1, candidateID: 1 });

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
