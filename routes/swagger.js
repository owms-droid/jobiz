const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const swaggerOptions = {
    swaggerOptions: {
        withCredentials: true,
    },
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', (req, res, next) => {
    const dynamicDoc = Object.assign({}, swaggerDocument, {
        host: req.headers.host,
        schemes: [req.protocol],
    });
    swaggerUi.setup(dynamicDoc, swaggerOptions)(req, res, next);
});

module.exports = router;