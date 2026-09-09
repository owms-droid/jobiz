const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'You must be logged in to perform this action.' });
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required.' });
};

const isSuperAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'superadmin') {
        return next();
    }
    res.status(403).json({ message: 'Access denied: Super Admins only.' });
};

const canAccessUser = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const currentUserId = String(req.user._id);
    const targetUserId = String(req.params.id || req.body?.userId || '');

    if (req.user.role === 'admin' || req.user.role === 'superadmin' || currentUserId === targetUserId) {
        return next();
    }

    return res.status(403).json({ message: 'You do not have permission to access this user.' });
};

const canAccessJobPost = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const currentUserId = String(req.user._id);
    const suppliedOwnerId = String(req.body?.created_by || req.body?.userId || req.params.created_by || '');
    const currentPostOwnerId = req.post ? String(req.post.created_by || req.post.user_id) : suppliedOwnerId;

    if (req.user.role === 'admin' || req.user.role === 'superadmin' || currentUserId === currentPostOwnerId) {
        return next();
    }

    return res.status(403).json({ message: 'You do not have permission to modify this job post.' });
};

module.exports = { 
    isAuthenticated, 
    isAdmin, 
    isSuperAdmin,
    canAccessUser,
    canAccessJobPost,
};
