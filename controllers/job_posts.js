const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllPosts = async (req, res, next) => {
    // #swagger.tags = ['Job Posts']
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
    // #swagger.tags = ['Job Posts']
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

const createPost = async (req, res, next) => {
    // #swagger.tags = ['Job Posts']
    const post = {
        title: req.body.title,
        description: req.body.description,
        service_type: req.body.service_type,
        location: req.body.location,
        status: req.body.status || 'active',
        expires_at: req.body.expires_at,
        created_at: req.body.created_at || new Date().toISOString(),
    };

    if (!post.title || !post.description) {
        res.status(400).json({ message: 'Title and description are required.' });
        return;
    }

    try {
        const response = await mongodb.getDatabase().db().collection('job_posts').insertOne(post);
        if (response.acknowledged) {
            res.status(201).json({ _id: response.insertedId, ...post });
            return;
        }
        res.status(500).json({ message: 'Some error occurred while creating the post.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while creating the post.' });
    }
};

const updatePost = async (req, res, next) => {
    // #swagger.tags = ['Job Posts']
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Must use a valid post id to update a post.' });
        return;
    }

    const { title, description, service_type, location, status, expires_at, created_at } = req.body;

    if (!title || !description) {
        res.status(400).json({ message: 'Title and description are required.' });
        return;
    }

    const updatedPost = { title, description, service_type, location, status, expires_at, created_at };
    const postId = new ObjectId(req.params.id);

    try {
        const response = await mongodb
            .getDatabase()
            .db()
            .collection('job_posts')
            .replaceOne({ _id: postId }, updatedPost);

        if (response.matchedCount === 0) {
            res.status(404).json({ message: 'Post was not found.' });
            return;
        }
        res.status(200).json({ message: 'Post updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while updating the post.' });
    }
};

const deletePost = async (req, res, next) => {
    // #swagger.tags = ['Job Posts']
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Must use a valid post id to delete a post.' });
        return;
    }

    const postId = new ObjectId(req.params.id);

    try {
        const response = await mongodb
            .getDatabase()
            .db()
            .collection('job_posts')
            .deleteOne({ _id: postId });

        if (response.deletedCount === 0) {
            res.status(404).json({ message: 'Post was not found.' });
            return;
        }
        res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while deleting the post.' });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};