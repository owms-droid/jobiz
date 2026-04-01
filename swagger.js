const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Jobiz API',
        description: 'App that helps to offer your services and get clients',
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
