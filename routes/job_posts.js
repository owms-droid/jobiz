const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/job_posts');
const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', jobPostController.getAllPosts);
router.post('/', isAuthenticated, jobPostController.createPost);
router.get('/:id', jobPostController.getPostById);
router.put('/:id', isAuthenticated, jobPostController.updatePost);
router.delete('/:id', isAuthenticated, jobPostController.deletePost);

module.exports = router;