const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongodb = require('./data/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const passport = require('./config/passport');
const app = express();

const port = process.env.PORT || 3000;

app
    .use(bodyParser.json())
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
        );
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );
        next();
    })
    .use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
            cookie: { secure: process.env.NODE_ENV === 'production' },
        })
    )
    .use(passport.initialize())
    .use(passport.session())
    .use('/', require('./routes'));

mongodb.initDb((err) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
    } else {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
});

