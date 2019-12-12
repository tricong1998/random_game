const redis = require('redis');
const util = require('util');

  /* Values are hard-coded for this example, it's usually best to bring these in via file or environment variable for production */
let client; 
if (!client) {
  client = redis.createClient({
    port      : 6379,               // replace with your port
    host      : '127.0.0.1',        // replace with your hostanme or IP address
});
}

const promiseClient = {
  setex: util.promisify(client.setex).bind(client),
  set: util.promisify(client.set).bind(client),
  get: util.promisify(client.get).bind(client),
  del: util.promisify(client.del).bind(client),
};


module.exports = promiseClient;