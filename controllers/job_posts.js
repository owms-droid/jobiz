const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllPosts = async (req, res, next) => {
    try {
        const result = await mongodb.getDatabase().db().collection('job_posts').find();
        const posts = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while retrieving posts.' });
    }
};

const getPostById = async (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json('Must use a valid post id to find a post.');
        return;
    }
    const postId = new ObjectId(req.params.id);
    try {
        const result = await mongodb.getDatabase().db().collection('job_posts').find({ _id: postId });
        const posts = await result.toArray();
        if (!posts || posts.length === 0) {
            res.status(404).json('Post was not found.');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(posts[0]);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while retrieving the post.' });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
};