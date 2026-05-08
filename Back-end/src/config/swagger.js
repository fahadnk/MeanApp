import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MeanApp API',
      version: '1.0.0',
      description: 'API documentation for your MEAN app',
    },
    servers: [
      {
        url: 'http://localhost:5000', // change if needed
      },
    ],
  },
  apis: ['./src/routes/**/*.js'] // 👈 adjust based on your repo
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;