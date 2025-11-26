import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'memory-tap-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // set to true if https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
