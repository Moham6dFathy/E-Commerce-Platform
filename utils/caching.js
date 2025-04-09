const createClient = require('redis').createClient;
require('dotenv').config({ path: './config.env' });

//Connect to Redis
const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect().then(() => {
  console.log('redis connected successfully');
});

module.exports = client;
