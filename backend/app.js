import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import adminRoutes from './routes/admin.js';
import companyRoutes from './routes/company.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- START: DEFINITIVE CORS FIX ---

// 1. Define the list of allowed URLs
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
];

// 2. Only add the CLIENT_URL if it's actually set in the environment
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// 3. Set up CORS options with logging
const corsOptions = {
  origin: (origin, callback) => {
    // Log the incoming request origin for debugging
    console.log(`CORS Check: Request from origin: ${origin}`);
    
    // Allow requests if they have no origin (like Postman) or are in our whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not in allowed list.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// 4. Use the CORS middleware
app.use(cors(corsOptions));

// --- END: DEFINITIVE CORS FIX ---


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully! ✅'))
  .catch(err => console.log('MongoDB Connection Error:', err));

app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});