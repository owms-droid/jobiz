const router = require('express').Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    //#swagger.tags = ['Home']
    res.json({ message: 'Welcome to the API' });
});

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/job_posts', require('./job_posts'));

module.exports = router;