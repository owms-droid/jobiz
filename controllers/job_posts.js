const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllPosts = async (req, res) => {
    const result = await mongodb.getDatabase().db().collection('posts').find();
    result.toArray().then((posts) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(posts);
    });
};

const getPostById = async (req, res) => {
    const postId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db().collection('posts').find({ _id: postId });
    result.toArray().then((posts) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(posts[0]);
    });
};

module.exports = {
    getAllPosts,
    getPostById,
};