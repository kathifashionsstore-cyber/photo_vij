import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Route Imports
import whatsappRouter from './routes/whatsapp.js';
import escalationsRouter from './routes/escalations.js';
import backupRouter from './routes/backup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting middleware to prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/escalations', escalationsRouter);
app.use('/api/backup', backupRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Snaplica Photography API running on port ${PORT}`);
});
