const client = require('./redisClient');
const eosService = require('./eosService');
const Const = require('./Const');

async function callAfterStartCommit(game) {
  console.log(`start count`);
  await delay(game.expireCommitTime);
  console.log(`end acount`);

  const secret = client.get(Const.prefixGameSecret + game.id);
  if (secret) {
    await (eosService.startReveal(game.id, secret));
  }
}

function delay(t, val) {
  return new Promise(function(resolve) {
      setTimeout(function() {
          resolve(val);
      }, t);
  });
}

module.exports = {
  callAfterStartCommit,
  delay
}