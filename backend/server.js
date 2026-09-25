import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './database/db.js';
import authRoute from './routes/authRoutes.js';
import eventRoute from './routes/eventRoutes.js';
import userRoute from './routes/userRoutes.js';
import contactRoute from './routes/contactRoutes.js';
import clubRoute from './routes/clubRoutes.js';
import adminRoute from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // React default
  'http://localhost:5174', // Vite alternative
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://frontend-tawny-eta-93.vercel.app',
  'https://qu-event-hub.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow any origin in development, restrict in production
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check route to keep Render awake
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});


app.use('/api/auth', authRoute);  
app.use('/api/events', eventRoute);
app.use('/api/user', userRoute);
app.use('/api/contact', contactRoute);
app.use('/api/clubs', clubRoute);
app.use('/api/admin', adminRoute);

app.use((error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'Image must be 2 MB or smaller.' });
    }
    if (error.message === 'Only image files are allowed.') {
        return res.status(400).json({ message: error.message });
    }
    next(error);
});
app.use(errorHandler);

// Connect to database first, then start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();


// import dotenv from 'dotenv';
// // 1. MUST be called synchronously at the very top.
// dotenv.config(); 

// import express from 'express';
// import cors from 'cors';
// import connectDB from './database/db.js';
// import userRoutes from './routes/userRoutes.js';
// import eventRoutes from './routes/eventRoutes.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// // --- Database Connection ---
// connectDB(); // Now, MONGO_URI should be defined when this runs

// const app = express();

// // --- Middleware ---
// app.use(cors());
// app.use(express.json()); // Allows parsing JSON body
// app.use(express.urlencoded({ extended: true })); // Allows parsing form data

// // --- Routes ---
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// app.use('/api/users', userRoutes);
// app.use('/api/events', eventRoutes);

// // --- Error Handling Middleware ---
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });