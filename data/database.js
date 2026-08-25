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
                await client.db().collection('users').createIndex({ email: 1 }, { unique: true });
                console.log('Database constraints: verified unique index on users.email');
            } catch (indexErr) {
                console.error('Database constraints warning: failed to verify unique index on users.email', indexErr);
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