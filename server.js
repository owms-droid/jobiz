const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { validateEnv } = require('./utils/env');

try {
    validateEnv();
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
        throw new Error('Missing required environment variables: ALLOWED_ORIGINS');
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const mongodb = require('./data/database');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const passport = require('./config/passport');
const { csrfProtection } = require('./middleware/csrf');
const app = express();
app.set('trust proxy', 1);

const port = process.env.PORT || 3000;

app
    .use(express.json({ limit: '100kb' }))
    .use((req, res, next) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
            : [];
        const origin = req.headers.origin;

        if (origin && (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin))) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }

        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
        );
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );

        // Intercept preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    })
    .use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24,
            },
        })
    )
    .use(passport.initialize())
    .use(passport.session())
    .use(csrfProtection)
    .get('/health', (req, res) => {
        res.status(200).json({ ok: true, status: 'healthy' });
    })
    .use('/', require('./routes'));

// Centralized JSON Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'An internal server error occurred.',
        error: process.env.NODE_ENV === 'production' ? undefined : err.stack || err.toString()
    });
});

mongodb.initDb((err) => {
    if (err) {
        console.error('CRITICAL ERROR: Failed to connect to MongoDB. Exiting...', err);
        process.exit(1); // Fail-fast deployment check for hosting providers
    } else {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
});
