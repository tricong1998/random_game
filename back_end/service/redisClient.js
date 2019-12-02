const redis = require('redis');
  /* Values are hard-coded for this example, it's usually best to bring these in via file or environment variable for production */
const client = redis.createClient({
    port      : 6379,               // replace with your port
    host      : '127.0.0.1',        // replace with your hostanme or IP address
});

module.exports = client;