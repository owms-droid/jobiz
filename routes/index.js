const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

router.use('/users', require('./users'));
router.use('/job_posts', require('./job_posts'));

module.exports = router;