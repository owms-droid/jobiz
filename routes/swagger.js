const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const swaggerOptions = {
    swaggerOptions: {
        withCredentials: true,
    },
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

module.exports = router;