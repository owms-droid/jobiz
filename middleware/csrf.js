const crypto = require('node:crypto');

const issueCsrfToken = (req, res) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.status(200).json({ csrfToken: req.session.csrfToken });
};

const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const expectedToken = req.session?.csrfToken;
    const providedToken = req.get('x-csrf-token');

    const expectedBuffer = expectedToken ? Buffer.from(expectedToken) : null;
    const providedBuffer = providedToken ? Buffer.from(providedToken) : null;
    const validToken = expectedBuffer && providedBuffer && expectedBuffer.length === providedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!validToken) {
        return res.status(403).json({ message: 'CSRF token is missing or invalid.' });
    }

    return next();
};

module.exports = { issueCsrfToken, csrfProtection };
