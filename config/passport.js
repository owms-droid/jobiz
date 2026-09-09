const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongodb = require('../data/database');

const hasGitHubConfig = () =>
    Boolean(
        process.env.GITHUB_CLIENT_ID &&
        process.env.GITHUB_CLIENT_SECRET &&
        process.env.GITHUB_CALLBACK_URL
    );

const buildGitHubUserRecord = (profile) => ({
    githubId: String(profile.id),
    full_name: profile.displayName || profile.username || 'GitHub User',
    email: profile.emails?.[0]?.value || (profile.username ? `${profile.username}@github-user.local` : ''),
    role: 'user',
    avatar: profile.photos?.[0]?.value || '',
    created_at: new Date().toISOString(),
});

const findOrCreateGithubUser = async (db, profile) => {
    const collection = db.collection('users');
    const email = profile.emails?.[0]?.value || '';
    const normalizedProfile = buildGitHubUserRecord(profile);

    let user = await collection.findOne({ githubId: normalizedProfile.githubId });

    if (!user && email) {
        user = await collection.findOne({ email });
    }

    if (user) {
        const updates = {};

        if (!user.githubId) {
            updates.githubId = normalizedProfile.githubId;
        }

        if (!user.full_name && normalizedProfile.full_name) {
            updates.full_name = normalizedProfile.full_name;
        }

        if (!user.avatar && normalizedProfile.avatar) {
            updates.avatar = normalizedProfile.avatar;
        }

        if (!user.email && email) {
            updates.email = email;
        }

        if (!user.role) {
            updates.role = 'user';
        }

        if (Object.keys(updates).length > 0) {
            await collection.updateOne({ _id: user._id }, { $set: updates });
            user = { ...user, ...updates };
        }

        return user;
    }

    const result = await collection.insertOne(normalizedProfile);
    return { _id: result.insertedId, ...normalizedProfile };
};

if (hasGitHubConfig()) {
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
                    const user = await findOrCreateGithubUser(db, profile);
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    const id = user && user._id ? user._id.toString() : user;
    done(null, id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { ObjectId } = require('mongodb');
        const user = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .findOne({ _id: new ObjectId(id) });

        done(null, user || null);
    } catch (err) {
        done(err, null);
    }
});

passport.buildGitHubUserRecord = buildGitHubUserRecord;
passport.findOrCreateGithubUser = findOrCreateGithubUser;
passport.hasGitHubConfig = hasGitHubConfig;

module.exports = passport;
