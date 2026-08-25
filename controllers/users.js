const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res, next) => {
    // #swagger.tags = ['Users']
    try {
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .find({}, { projection: { password_hash: 0 } });
        const users = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while retrieving users.' });
    }
};

const getUserById = async (req, res, next) => {
    // #swagger.tags = ['Users']
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json('Must use a valid user id to find a user.');
        return;
    }
    const userId = new ObjectId(req.params.id);
    try {
        const user = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .findOne({ _id: userId }, { projection: { password_hash: 0 } });
        if (!user) {
            res.status(404).json('User was not found.');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while retrieving the user.' });
    }
};

const createUser = async (req, res, next) => {
    // #swagger.tags = ['Users']
    const { full_name, email, password, dni_number, age, role, address, skills } = req.body;

    if (!full_name || !email || !password) {
        res.status(400).json({ message: 'full_name, email, and password are required.' });
        return;
    }

    try {
        const db = mongodb.getDatabase().db();
        
        // Email uniqueness check
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'A user with this email already exists.' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 12);
        
        // Auto bootstrap first Super Admin if email matches env variable
        const isSuperAdmin = process.env.SUPER_ADMIN_EMAIL && email === process.env.SUPER_ADMIN_EMAIL;
        
        const user = { 
            full_name, 
            dni_number, 
            age, 
            email, 
            password_hash, 
            role: isSuperAdmin ? 'superadmin' : (role || 'user'), 
            address, 
            skills 
        };

        const response = await db.collection('users').insertOne(user);
        if (response.acknowledged) {
            const { password_hash: _omit, ...safeUser } = user;
            res.status(201).json({ _id: response.insertedId, ...safeUser });
            return;
        }
        res.status(500).json({ message: 'Some error occurred while creating the user.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while creating the user.' });
    }
};

const updateUser = async (req, res, next) => {
    // #swagger.tags = ['Users']
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Must use a valid user id to update a user.' });
        return;
    }

    const userId = new ObjectId(req.params.id);
    const { full_name, email, dni_number, age, role, address, skills } = req.body;

    if (!full_name || !email) {
        res.status(400).json({ message: 'full_name and email are required.' });
        return;
    }

    try {
        const db = mongodb.getDatabase().db();
        const targetUser = await db.collection('users').findOne({ _id: userId });
        if (!targetUser) {
            res.status(404).json({ message: 'User was not found.' });
            return;
        }

        // Authorization Check:
        // 1. Owner can update
        // 2. Super Admin can update anyone
        // 3. Admin can update normal users (but not other Admins or Super Admins)
        const isOwner = req.user._id.toString() === req.params.id;
        const isSuperAdminUser = req.user.role === 'superadmin';
        const isAdminUser = req.user.role === 'admin';

        let authorized = false;
        if (isOwner) {
            authorized = true;
        } else if (isSuperAdminUser) {
            authorized = true;
        } else if (isAdminUser && targetUser.role !== 'admin' && targetUser.role !== 'superadmin') {
            authorized = true;
        }

        if (!authorized) {
            res.status(403).json({ message: 'You are not authorized to update this profile.' });
            return;
        }

        // Check for email conflicts
        const existingUser = await db.collection('users').findOne({ 
            email, 
            _id: { $ne: userId } 
        });
        if (existingUser) {
            res.status(409).json({ message: 'A user with this email already exists.' });
            return;
        }

        // Construct update operations using $set to prevent overwriting OAuth fields
        const updateFields = {};
        if (full_name !== undefined) updateFields.full_name = full_name;
        if (email !== undefined) updateFields.email = email;
        if (dni_number !== undefined) updateFields.dni_number = dni_number;
        if (age !== undefined) updateFields.age = age;
        if (address !== undefined) updateFields.address = address;
        if (skills !== undefined) updateFields.skills = skills;

        // Role assignment authorization:
        // - Super Admin can assign any role ('user', 'admin', 'superadmin')
        // - Admin can promote to 'admin' or demote to 'user' for users below superadmin status
        // - Regular users cannot assign roles
        if (role !== undefined) {
            if (isSuperAdminUser) {
                updateFields.role = role;
            } else if (isAdminUser && ['user', 'admin'].includes(role) && targetUser.role !== 'superadmin') {
                updateFields.role = role;
            } else if (role !== targetUser.role) {
                res.status(403).json({ message: 'You are not authorized to assign this role.' });
                return;
            }
        }

        // Hash new password if provided
        if (req.body.password) {
            updateFields.password_hash = await bcrypt.hash(req.body.password, 12);
        }

        const response = await db
            .collection('users')
            .updateOne({ _id: userId }, { $set: updateFields });

        if (response.matchedCount === 0) {
            res.status(404).json({ message: 'User was not found.' });
            return;
        }
        res.status(200).json({ message: 'User updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while updating the user.' });
    }
};

const deleteUser = async (req, res, next) => {
    // #swagger.tags = ['Users']
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Must use a valid user id to delete a user.' });
        return;
    }

    const userId = new ObjectId(req.params.id);

    try {
        const db = mongodb.getDatabase().db();
        const targetUser = await db.collection('users').findOne({ _id: userId });
        if (!targetUser) {
            res.status(404).json({ message: 'User was not found.' });
            return;
        }

        // Authorization Check:
        // 1. Owner can delete
        // 2. Super Admin can delete anyone
        // 3. Admin can delete normal users (but not other Admins or Super Admins)
        const isOwner = req.user._id.toString() === req.params.id;
        const isSuperAdminUser = req.user.role === 'superadmin';
        const isAdminUser = req.user.role === 'admin';

        let authorized = false;
        if (isOwner) {
            authorized = true;
        } else if (isSuperAdminUser) {
            authorized = true;
        } else if (isAdminUser && targetUser.role !== 'admin' && targetUser.role !== 'superadmin') {
            authorized = true;
        }

        if (!authorized) {
            res.status(403).json({ message: 'You are not authorized to delete this profile.' });
            return;
        }

        const response = await db.collection('users').deleteOne({ _id: userId });

        if (response.deletedCount === 0) {
            res.status(404).json({ message: 'User was not found.' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while deleting the user.' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};