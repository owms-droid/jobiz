const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res, next) => {
    // #swagger.tags = ['Users']
    try {
        const result = await mongodb.getDatabase().db().collection('users').find();
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
        const result = await mongodb.getDatabase().db().collection('users').find({ _id: userId });
        const users = await result.toArray();
        if (!users || users.length === 0) {
            res.status(404).json('User was not found.');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users[0]);
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
        const password_hash = await bcrypt.hash(password, 12);
        const user = { full_name, dni_number, age, email, password_hash, role, address, skills };

        const response = await mongodb.getDatabase().db().collection('users').insertOne(user);
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

    const { full_name, email, dni_number, age, password_hash, role, address, skills } = req.body;

    if (!full_name || !email) {
        res.status(400).json({ message: 'full_name and email are required.' });
        return;
    }

    const updatedUser = { full_name, dni_number, age, email, password_hash, role, address, skills };
    const userId = new ObjectId(req.params.id);

    try {
        const response = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .replaceOne({ _id: userId }, updatedUser);

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
        const response = await mongodb
            .getDatabase()
            .db()
            .collection('users')
            .deleteOne({ _id: userId });

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