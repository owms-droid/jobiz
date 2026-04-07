const router = require('express').Router();
const passport = require('passport');
const { loginCallback, logout, getProfile } = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/authenticate');

// GET /auth/login  — redirects to GitHub
router.get(
    '/login',
    /*  #swagger.tags = ['Auth']
        #swagger.summary = 'Login with GitHub'
        #swagger.description = 'Redirects user to GitHub OAuth login page.'
        #swagger.responses[302] = { description: 'Redirect to GitHub' }
    */
    passport.authenticate('github', { scope: ['user:email'] })
);

// GET /auth/github/callback  — GitHub redirects here after login
router.get(
    '/github/callback',
    /*  #swagger.tags = ['Auth']
        #swagger.summary = 'GitHub OAuth callback'
        #swagger.description = 'Handles the GitHub OAuth callback, establishes session.'
        #swagger.responses[200] = { description: 'Login successful' }
        #swagger.responses[401] = { description: 'Authentication failed' }
    */
    passport.authenticate('github', { failureRedirect: '/auth/login', session: true }),
    loginCallback
);

// GET /auth/logout
router.get(
    '/logout',
    /*  #swagger.tags = ['Auth']
        #swagger.summary = 'Logout'
        #swagger.description = 'Destroys the current session and logs the user out.'
        #swagger.responses[200] = { description: 'Logged out successfully' }
    */
    logout
);

// GET /auth/profile  — protected: must be logged in
router.get(
    '/profile',
    /*  #swagger.tags = ['Auth']
        #swagger.summary = 'Get current user profile'
        #swagger.description = 'Returns profile of the authenticated user. Requires login.'
        #swagger.security = [{ "githubOAuth": [] }]
        #swagger.responses[200] = { description: 'User profile returned' }
        #swagger.responses[401] = { description: 'Not authenticated' }
    */
    isAuthenticated,
    getProfile
);

module.exports = router;
