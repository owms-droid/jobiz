const login = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Redirects to GitHub OAuth login page.'
    // intentionally empty — handled by passport middleware in route
};

const loginCallback = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'GitHub OAuth callback. Sets session and returns logged-in user.'
    res.status(200).json({
        message: 'Logged in successfully.',
        user: {
            _id: req.user._id,
            full_name: req.user.full_name,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

const logout = (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Logs out the current session.'
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: 'Logged out successfully.' });
    });
};

const getProfile = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Returns the current logged-in user profile. Requires authentication.'
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    res.status(200).json({
        _id: req.user._id,
        full_name: req.user.full_name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
    });
};

module.exports = { login, loginCallback, logout, getProfile };
