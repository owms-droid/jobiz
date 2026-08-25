const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/job_posts');
const { isAuthenticated } = require('../middleware/authenticate');
const { validateJobPost } = require('../middleware/validation');

router.get('/', jobPostController.getAllPosts);
router.post('/', isAuthenticated, validateJobPost, jobPostController.createPost);
router.get('/:id', jobPostController.getPostById);
router.put('/:id', isAuthenticated, validateJobPost, jobPostController.updatePost);
router.delete('/:id', isAuthenticated, jobPostController.deletePost);

module.exports = router;