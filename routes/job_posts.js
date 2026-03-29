const express = require('express');
const router = express.Router();

const jobPostController = require('../controllers/job_posts');

router.get('/', jobPostController.getAllPosts);
router.get('/:id', jobPostController.getPostById);

module.exports = router;