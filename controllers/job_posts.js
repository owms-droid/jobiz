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
        const post = await mongodb.getDatabase().db().collection('job_posts').findOne({ _id: postId });
        if (!post) {
            res.status(404).json('Post was not found.');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Some error occurred while retrieving the post.' });
    }
};

const createPost = async (req, res, next) => {
    // #swagger.tags = ['Job Posts']
    const { title, description, service_type, location, status, expires_at } = req.body;

    if (!title || !description) {
        res.status(400).json({ message: 'Title and description are required.' });
        return;
    }

    const post = {
        title,
        description,
        service_type,
        location,
        status: status || 'active',
        expires_at,
        created_at: req.body.created_at || new Date().toISOString(),
        user_id: req.user._id, // Associate post with the authenticated user
    };

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

    const postId = new ObjectId(req.params.id);
    const { title, description, service_type, location, status, expires_at, created_at } = req.body;

    if (!title || !description) {
        res.status(400).json({ message: 'Title and description are required.' });
        return;
    }

    try {
        const db = mongodb.getDatabase().db();
        const post = await db.collection('job_posts').findOne({ _id: postId });

        if (!post) {
            res.status(404).json({ message: 'Post was not found.' });
            return;
        }

        // Authorization Check: Must be the post creator or an admin/superadmin
        const isCreator = post.user_id && post.user_id.toString() === req.user._id.toString();
        const hasOverridingRole = req.user.role === 'admin' || req.user.role === 'superadmin';

        if (!isCreator && !hasOverridingRole) {
            res.status(403).json({ message: 'You are not authorized to update this job post.' });
            return;
        }

        // Use updateOne with $set to prevent deleting fields like user_id
        const updateFields = {
            title,
            description,
            service_type,
            location,
            status: status || 'active',
            expires_at,
            created_at: created_at || post.created_at,
            user_id: post.user_id || req.user._id, // Preserve existing creator or take ownership if legacy
        };

        const response = await db
            .collection('job_posts')
            .updateOne({ _id: postId }, { $set: updateFields });

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
        const db = mongodb.getDatabase().db();
        const post = await db.collection('job_posts').findOne({ _id: postId });

        if (!post) {
            res.status(404).json({ message: 'Post was not found.' });
            return;
        }

        // Authorization Check: Must be the post creator or an admin/superadmin
        const isCreator = post.user_id && post.user_id.toString() === req.user._id.toString();
        const hasOverridingRole = req.user.role === 'admin' || req.user.role === 'superadmin';

        if (!isCreator && !hasOverridingRole) {
            res.status(403).json({ message: 'You are not authorized to delete this job post.' });
            return;
        }

        const response = await db.collection('job_posts').deleteOne({ _id: postId });

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