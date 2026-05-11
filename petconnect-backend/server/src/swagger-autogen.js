import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'PetConnect API',
    version: '1.0.0',
    description: 'API documentation for PetConnect — Pet Adoption Platform',
  },
  host: 'localhost:5000',
  basePath: '/',
  schemes: ['http'],
  security: [{ bearerAuth: [] }],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Enter: Bearer <your_token>',
    },
  },
  tags: [
    { name: 'Auth',          description: 'Register, login, OTP, forgot password' },
    { name: 'Users',         description: 'User profile management' },
    { name: 'Shelters',      description: 'Shelter registration & management' },
    { name: 'Pets',          description: 'Pet listings & browsing' },
    { name: 'Adoption',      description: 'Adoption applications & status' },
    { name: 'Conversations', description: 'In-app messaging' },
    { name: 'Wishlist',      description: 'Pet wishlist' },
    { name: 'Reports',       description: 'User reports' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Admin',         description: 'Admin panel & analytics' },
  ],
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
