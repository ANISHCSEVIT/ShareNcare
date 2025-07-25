import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // <-- Make sure this is imported

// **THE FIX IS HERE**: Call dotenv.config() at the top
dotenv.config();

// Import routes
import adminRoutes from './routes/admin.js';
import companyRoutes from './routes/company.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI) // <-- No options needed for modern Mongoose
  .then(() => console.log('MongoDB Atlas connected successfully! ✅'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});