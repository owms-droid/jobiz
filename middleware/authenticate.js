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
    res.status(403).json({ message: 'Access denied: Admins only.' });
};

const isSuperAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'superadmin') {
        return next();
    }
    res.status(403).json({ message: 'Access denied: Super Admins only.' });
};

module.exports = { 
    isAuthenticated, 
    isAdmin, 
    isSuperAdmin 
};
