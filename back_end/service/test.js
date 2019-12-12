const sha = require('sha256');
const ranString = require('randomstring');
const redis = require('./redisClient');
// sendTx('bob', 'randomgame', 2, '2', '5Ht7ZTzi28r7yMJ7y1GZbZsPZQZuCExUW5oepETafBwfMuK5mRp');
// sendTx('alice', 'randomgame', 2, '2', '5JdaTWzvdJqPXkz2ntvf4gYubqNu4ge2XWgqhE9z9nZ5qyZEBLK');
function delay(t, val) {
  return new Promise(function(resolve) {
      setTimeout(function() {
          resolve(val);
      }, t);
  });
}
function tes() {
  test();
  console.log('end')
}
async function test() {
  console.log(sha('1aaa'));  
  await delay(5000);
  console.log((Date.now()));
  // ranString.generate({
  //   length: 12,
  //   charset: 'alphabetic'
  // })
};
async function test2() {
  await redis.set(`test`, `test`);
  console.log(await redis.get(`test`))
}
test2().then(async () => {
  console.log(await redis.get(`test`))
})


