const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongodb = require('../data/database');


passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const db = mongodb.getDatabase().db();
                let user = await db.collection('users').findOne({ githubId: profile.id });

                if (!user) {
                    const result = await db.collection('users').insertOne({
                        githubId: profile.id,
                        full_name: profile.displayName || profile.username,
                        email: (profile.emails && profile.emails[0]?.value) || '',
                        role: 'user',
                        avatar: profile.photos?.[0]?.value || '',
                    });
                    user = { _id: result.insertedId, githubId: profile.id };
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const { ObjectId } = require('mongodb');
        const user = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
