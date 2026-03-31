const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllUsers = async (req, res, next) => {
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

module.exports = {
    getAllUsers,
    getUserById,
};