// import express from 'express';
// import cors from 'cors';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import mongoose from 'mongoose';
// import morgan from 'morgan';

// // Configuration
// import { env } from './config/env.js';

// // Routes
// import authRoutes from './routes/auth.js';
// import expenseRoutes from './routes/expenses.js';
// import billRoutes from './routes/bills.js';
// import warrantyRoutes from './routes/warranties.js';

// // Middleware
// import { authenticateToken } from './middleware/auth.js';
// import { errorHandler } from './middleware/errorHandler.js';
// // import { rateLimiter, authLimiter } from './middleware/rateLimiter.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();

// // Middleware
// app.use(morgan('combined'));
// app.use(cors({ origin: env.CORS_ORIGIN }));
// console.log(`CORS Origin Allowed: ${env.CORS_ORIGIN}`);
// app.use(express.json());
// // Add this near your other middleware setup
// app.use('/uploads', express.static('uploads'));

// // Apply rate limiting
// // app.use('/api/auth', authLimiter);
// // app.use(rateLimiter);

// // Database Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(env.MONGODB_URI);
//     console.log('MongoDB Connected');
//   } catch (error) {
//     console.error('MongoDB Connection Error:', error);
//     process.exit(1);
//   }
// };

// connectDB();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/expenses', authenticateToken, expenseRoutes);
// app.use('/api/bills', authenticateToken, billRoutes);
// app.use('/api/warranties', authenticateToken, warrantyRoutes);

// // Default route
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// // Error handling middleware
// app.use(errorHandler);

// app.listen(env.PORT, () => {
//   console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Routes
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import billRoutes from './routes/bills.js';
import warrantyRoutes from './routes/warranties.js';

// Middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
// import { rateLimiter, authLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config({ path: './../.env' });

// Validate environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default('5000'),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
});

let env;
try {
  env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  });
} catch (error) {
  console.error('Environment validation error:', error.errors);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors({ origin: env.CORS_ORIGIN }));
console.log(`CORS Origin Allowed: ${env.CORS_ORIGIN}`);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply rate limiting (optional)
// app.use('/api/auth', authLimiter);
// app.use(rateLimiter);

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/bills', authenticateToken, billRoutes);
app.use('/api/warranties', authenticateToken, warrantyRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
