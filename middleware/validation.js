/**
 * Custom request validation middleware for Jobiz API.
 * Avoids extra third-party dependencies while providing secure, strict schema checks.
 */

const validateUser = (req, res, next) => {
    const { full_name, email, password, age, role, skills } = req.body;
    const errors = [];

    // Check for required fields on user creation (POST) or update (PUT)
    if (req.method === 'POST') {
        if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
            errors.push('full_name is required and must be a non-empty string.');
        }
        if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            errors.push('email is required and must be a valid email address.');
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            errors.push('password is required and must be at least 6 characters long.');
        }
    } else if (req.method === 'PUT') {
        // For updates, check only if they are provided
        if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim() === '')) {
            errors.push('full_name must be a non-empty string.');
        }
        if (email !== undefined && (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email))) {
            errors.push('email must be a valid email address.');
        }
        if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
            errors.push('password must be at least 6 characters long.');
        }
    }

    // Optional field validation
    if (age !== undefined) {
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge < 0) {
            errors.push('age must be a positive integer.');
        }
    }

    if (role !== undefined && !['user', 'admin'].includes(role)) {
        errors.push("role must be either 'user' or 'admin'.");
    }

    if (skills !== undefined && !Array.isArray(skills)) {
        errors.push('skills must be an array of strings.');
    } else if (skills !== undefined) {
        const allStrings = skills.every(skill => typeof skill === 'string');
        if (!allStrings) {
            errors.push('all items in skills must be strings.');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

const validateJobPost = (req, res, next) => {
    const { title, description, status, expires_at } = req.body;
    const errors = [];

    // For POST/PUT, title and description are required
    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('title is required and must be a non-empty string.');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        errors.push('description is required and must be a non-empty string.');
    }

    if (status !== undefined && !['active', 'inactive', 'archived'].includes(status)) {
        errors.push("status must be one of 'active', 'inactive', or 'archived'.");
    }

    if (expires_at !== undefined && expires_at !== null) {
        const parsedDate = Date.parse(expires_at);
        if (isNaN(parsedDate)) {
            errors.push('expires_at must be a valid ISO date string.');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

module.exports = {
    validateUser,
    validateJobPost,
};
