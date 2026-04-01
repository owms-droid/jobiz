const express = require('express');
const router = express.Router();

const jobPostController = require('../controllers/job_posts');

router.get('/', jobPostController.getAllPosts);
router.post('/', jobPostController.createPost);
router.get('/:id', jobPostController.getPostById);
router.put('/:id', jobPostController.updatePost);
router.delete('/:id', jobPostController.deletePost);

module.exports = router;