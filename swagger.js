const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Jobiz API',
        description: 'App that helps to offer your services and get clients',
    },
    host: 'localhost:3000',
    schemes: ['https', 'http'],
    securityDefinitions: {
        githubOAuth: {
            type: 'oauth2',
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            flow: 'implicit',
            scopes: {
                'user:email': 'Read user email from GitHub',
            },
        },
    },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
