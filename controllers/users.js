const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

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
    const user = {
        full_name: req.body.full_name,
        dni_number: req.body.dni_number,
        age: req.body.age,
        email: req.body.email,
        password_hash: req.body.password_hash,
        role: req.body.role,
        address: req.body.address,
        skills: req.body.skills,
    };

    if (!user.full_name || !user.email) {
        res.status(400).json({ message: 'full_name and email are required.' });
        return;
    }

    try {
        const response = await mongodb.getDatabase().db().collection('users').insertOne(user);
        if (response.acknowledged) {
            res.status(201).json({ _id: response.insertedId, ...user });
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