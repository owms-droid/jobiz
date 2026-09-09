const MongoClient = require('mongodb').MongoClient;

let database;

const initDb = (callback) => {
    if (database) {
        console.warn('Trying to init DB again!');
        return callback(null, database);
    }
    MongoClient.connect(process.env.MONGODB_URI)
        .then(async (client) => {
            database = client;
            
            // Database-level constraints validation
            // Creates a unique index on 'email' to guarantee email uniqueness at the schema level.
            try {
                const users = client.db().collection('users');
                const posts = client.db().collection('job_posts');
                await users.createIndex({ email: 1 }, { unique: true });
                await users.createIndex({ githubId: 1 }, { unique: true, sparse: true });
                await posts.createIndex({ user_id: 1 });
                await posts.createIndex({ status: 1, expires_at: 1 });
                console.log('Database constraints: verified required indexes');
            } catch (indexErr) {
                return callback(indexErr);
            }

            callback(null, database);
        })
        .catch((err) => {
            callback(err);
        });
};

const getDatabase = () => {
    if (!database) {
        throw new Error('Database not initialized');
    }
    return database;
};

module.exports = {
    initDb,
    getDatabase,
};