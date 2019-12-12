const client = require('./redisClient');
const Const = require('./Const');

async function callAfterStartCommit(game, startReveal, revealFull, io) {
  console.log(`start count`);
  console.log(startReveal);
  await delay(game.expireCommitTime * 1000);
  console.log(`end acount`);

  const secret = await client.get(`${Const.prefixGameSecret}${game.activeKeyHash}`);
  console.log(`get successfully`)
  console.log(secret);
  if (secret) {
    console.log(`start reveal`)
    await startReveal(game.id, secret, io);
  }
  console.log(`no scret`)
  await delay(5000);
  await revealFull(game.id, io);
}

async function test(eosService) {
  console.log(eosService)
  const game = 'ss';
  const secret = 'sf';
  await client.set('a', 'aaa');
  const res = await eosService.startReveal(game, secret);
}

async function test2() {
  const game = 'ss';
  const secret = 'sf';
  const a = await client.get('a');
  console.log(a)
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
  delay,
  test,
  test2
}