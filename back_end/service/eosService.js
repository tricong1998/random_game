const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch');                                // node only
const { TextDecoder, TextEncoder } = require('util');               // node only
const BigNumber = require('bignumber.js');
const Const = require('./Const');
const rpc = new JsonRpc(process.env.ENDPOINT, { fetch });
const auth = require('./auth');
const sha256 = require('sha256');
const ranString = require('randomstring');
const client = require('./redisClient');
const countTime = require('./countTime');
// const newService = require('./newService');
const util = require('./util');

async function join(from, gameId, pv, io) {
  try {

    let game = await getOneGame(gameId);
    
    const account = await rpc.get_account(from);
    
    if (!account) {
      throw new Error(`Invalid account`);
    }

    if (!game) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }

    const balance = await getAddressBalance(from);

    if (balance.lt(game.feeJoin)) {
      throw new Error(`Player has insufficient balance`);
    }

    let players = await getPlayersGame(gameId);

    if (players.length >= game.numberPlayers) {
      throw new Error(`Game has had sufficient players`);
    }

    if (players.find(_player => _player.user === from)) {
      throw new Error(`Player has already joined game`);
    }
    const result = await sendToken(from, game.admin, game.feeJoin, gameId, pv);
    await countTime.delay(1000);
    players = await getPlayersGame(gameId);

    const player = players.find(_player => {
      return _player.user === from;
    });
    if (!player) {
      throw new Error (`Join fail`)
    }
    let isFull = false;
    const token = await auth.createToken(from, player.playerId, `${Const.prefixPlayer}${player.playerId}`);
    io.emit('join', { gameId });
    if (players.length >= game.numberPlayers) {
      isFull = true;
      startCommit(gameId, io);
    };
    // TODO socket
    return {
      result,
      token,
      isFull,
      playerId: player.playerId,
    }
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function sendToken(from, to, amount, memo, pv) {
  const tokenName = process.env.TOKEN_NAME;
  const curAmount = new BigNumber(amount);
  const actions = [{
    account: Const.transferSmartContract,
    name: Const.transferAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      from,
      to,
      quantity: curAmount.toFixed(parseInt(process.env.SCALE)) + ' ' + tokenName,
      memo,
    },
  }];
  try {
    return await sendTx(actions, pv);
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function sendTx(actions, pv) {
  const signatureProvider = new JsSignatureProvider([pv]);
  const api = new Api({ 
    rpc, 
    signatureProvider, 
    textDecoder: new TextDecoder(), 
    textEncoder: new TextEncoder() 
  });

  try {
    const result = await api.transact({
      actions
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    console.dir(result);
    return result;
  } catch (e) {
    if (e instanceof RpcError) {
      console.error(JSON.stringify(e.json, null, 2));
      throw new Error(e.json.error.details[0].message ? e.json.error.details[0].message : e);
    }

    throw new Error(e.message ? e.message : e);
  }

}

async function init(numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio, io) {
  const newFee = parseInt(new BigNumber(feeJoin).multipliedBy(new BigNumber(10).pow(process.env.SCALE)).toFixed(0));
  const from = process.env.ACCOUNT_RANDOM;
  const balance = await getAddressAvailableBalance(from);
  const maxAmountLoss = new BigNumber(feeJoin).multipliedBy(numberOfPlayers).multipliedBy(priceRatio).dividedBy(100);
  if (new BigNumber(balance).lt(maxAmountLoss.toFixed(parseInt(process.env.SCALE)))) {
    throw new Error(`Account has insufficient balance`);
  }
  const pv = process.env.PV;
  const date = Date.now();
  const activeKey = ranString.generate({
    length: Const.length,
    charset: Const.typeRandomString
  }) + date;
  const activeKeyHash = sha256(activeKey);
  
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.initAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      user: from,
      numberOfPlayers,
      activeKeyHash,
      feeJoin: newFee,
      expireCommitTime,
      expireJoinTime,
      priceRatio
    },
  }];
  try {
    const result = await sendTx(actions, pv);
    await client.set(`${Const.prefixGameSecret}${activeKeyHash}`, activeKey);
    const a = await client.get(`${Const.prefixGameSecret}{activeKeyHash}`);
    //TODO socket
    io.emit('init');
    return {
      result,
      activeKey,
    }
    // if (result) {
      // const game = await getOneGame()
    // }
    // countTime.callStartCommit()
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function commit(user, playerId, secret, io) {

  const _player = await getOnePlayer(playerId);
  const hashSecret = sha256(secret);
  if (!_player) {
    throw new Error(`Player didn't join game`);
  }
  const gameId = _player.gameId;
  const game = await getOneGame(gameId);

  if (!game) {
    throw new Error(`Game is not exist`);
  }

  if (game.state !==  Const.gameCommitState) {
    throw new Error(`Game is not in commit state`);
  }


  if (_player.isCommit) {
    throw new Error(`Player has commited`);
  }

  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;  
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.commitAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      hashSecret,
      playerId
    },
  }];
  try {
    const res = await sendTx(actions, pv);
    await client.set(`${Const.prefixSecretPlayer}${gameId}_${_player.playerId}`, secret);
    io.emit('commit', { playerId });
    return res;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }}

async function startCommit(gameId, io) {
  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;  
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.startCommitAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      gameId
    },
  }];
  try {
    const result = await sendTx(actions, pv);
    const game = await getOneGame(gameId);
    io.emit('start_commit', { gameId });
    await countTime.delay(2000);
    countTime.callAfterStartCommit(game, startReveal, revealFull, io);
    // TODO socket
    return {
      result,
    }
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function startReveal(gameId, secret, io) {
  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.startRevealAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      gameId,
      secretAdmin: secret
    },
  }];
  try {
    const res = await sendTx(actions, pv);
    io.emit('start_reveal', { gameId });
    return res;
    // TODO socket
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function reveal(playerId, secret, io) {
  const pv = process.env.PV;
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.revealAction,
    authorization: [{
      actor: process.env.ACCOUNT_RANDOM,
      permission: Const.acticePermission,
    }],
    data: {
      playerId,
      secret
    },
  }];
  await sendTx(actions, pv); 
  io.emit('reveal', { playerId });
  return;
}

async function revealFull(gameId, io) {
  const players = await getPlayersGame(gameId);
  // await Promise.all(players.map(async _player => {

  // }));
  for (let i = 0; i < players.length; i++) {
    if (players[i].isCommit !== 1) {
      continue;
    }
    const secret = await client.get(`${Const.prefixSecretPlayer}${gameId}_${players[i].playerId}`);
    await reveal(players[i].playerId, secret, io);
    await countTime.delay(50);
  }
  await countTime.delay(5000);
  await endGame(gameId, io);
  // TODO socket
}

async function endGame(gameId, io) {
  const players = await getPlayersGame(gameId);
  await Promise.all(players.map(async _player => {
    const key = `${Const.prefixPlayer}${_player.playerId}`;
    if (await client.get(key)) {
      await client.del(key);
    }
  }))
  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;
  const actions = [{
    account: process.env.ACCOUNT_RANDOM,
    name: Const.endGameAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      gameId
    },
  }];
  try {
    const res = await sendTx(actions, pv);
    io.emit('end_game', { gameId });
    return res;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function cancel(gameId, playerId, io) {
  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;
  const game = await getOneGame(gameId);

  if (game.state !== Const.gameJoinState) {
    throw new Error(`Game is not in join state!`);
  }

  const players = await getPlayersGame(gameId);
  if (players.length >= game.numberPlayers) {
    throw new Error(`Cannot cancel game if game has sufficient players`);
  }

  if (playerId) {
    if (!players.find(playerId)) {
      throw new Error(`Cannot cancel game if player is not in game`);
    }
  }
  const actions = [{
    account: from,
    name: Const.cancelAction,
    authorization: [{
      actor: from,
      permission: Const.acticePermission,
    }],
    data: {
      gameId
    },
  }];
  try {
    const res = await sendTx(actions, pv);
    io.emit('cancel', { gameId });
    return res;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getOneGame(gameId) {
  try {
    const listgames = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      lower_bound: gameId,     // Table primary key value
      index_position: 1,
      key_type: "i64",
      limit: 1,                   // Here we limit to 1 to get only the single row with primary key equal to 'testacc'
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!listgames) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }
    const games = listgames.rows;
    if (!games || !games.length) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }
    let game = games[0];
    game = await standardizeGame(game);
    return game;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getPlayersGame(gameId) {
  if (typeof gameId === 'string') {
    gameId = parseInt(gameId);
  }
  try {
    const listgames = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.playerTable,        // Table name
      table_key: Const.gameIdColumn,           // Table secondary key name
      lower_bound: gameId,     // Table primary key value
      upper_bound: gameId,
      index_position: 2,
      key_type: "i64",
      limit: 10,                   // Here we limit to 1 to get only the single row with primary key equal to 'testacc'
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!listgames) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }
    const players = listgames.rows;
    return players;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }  
}

async function getAllGame(page = 1, limit = 10) {
  try {
    const games = await rpc.get_table_rows({
      json: true,               // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      lower_bound: (page-1)*10,
      upper_bound: limit*2-1,
      limit: 10,                // Maximum number of rows that we want to get
      reverse: true,           // Optional: Get reversed data
      show_payer: false          // Optional: Show ram payer
    });
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    const result = await Promise.all(games.rows.map(_game => {
      return standardizeGame(_game);
    }))
    return {
      result,
      more: games.more,
    };
  } catch (e) {
    console.error(e)
    throw new Error(e.message ? e.message : e);
  }
}

async function getAllUnStarted() {
  try {
    const games = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      table_key: Const.stateSecondIndex,           // Table secondary key name
      index_position: 2,
      key_type: "i64",
      lower_bound: 0,            // Table secondary key value
      upper_bound: 0,
      limit: 10,                   // Here we limit to 1 to get only row
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    })
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    const result = await Promise.all(games.rows.map(_game => {
      return standardizeGame(_game);
    }))
    return result;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getAllFinished() {
  try {
    const games = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      table_key: 'bystate',           // Table secondary key name
      index_position: 2,
      key_type: "i64",
      lower_bound: 4,            // Table secondary key value
      upper_bound: 4,
      limit: 10,                   // Here we limit to 1 to get only row
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    const result = await Promise.all(games.rows.map(_game => {
      return standardizeGame(_game);
    }))
    return result;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getAllUnFinished() {
  try {
    const games = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      table_key: 'bystate',           // Table secondary key name
      index_position: 2,
      key_type: "i64",
      lower_bound: 0,            // Table secondary key value
      upper_bound: 3,
      limit: 10,                   // Here we limit to 1 to get only row
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    const result = await Promise.all(games.rows.map(_game => {
      return standardizeGame(_game);
    }))
    return result;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getOneTx(txId) {
  try {
    const tx = await rpc.history_get_transaction(txId);
    return util.standardizedTx(tx);
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getAddressBalance(account) {
  const balances = await rpc.get_currency_balance(process.env.CODE, account, process.env.TOKEN_NAME);
  if (!balances.length) {
    throw new Error(`Account has insufficient balance`);
  }
  // if (new BigNumber(arr[0]).gt(game.feeJoin)) {
  //   throw new Error(`Account has insufficient balance`);
  // }
  let balance;
  balances.forEach(_balance => {
    const arr = _balance.split(' ');
    if (arr[arr.length - 1] === process.env.TOKEN_NAME) {
      balance = arr[0];
      return;
    }
  });
  return new BigNumber(balance);
}

async function getOnePlayer(id) {
  try {
    const listPlayers = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.playerTable,        // Table name
      lower_bound: id,     // Table primary key value
      index_position: 1,
      key_type: "i64",
      limit: 1,                   // Here we limit to 1 to get only the single row with primary key equal to 'testacc'
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!listPlayers) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }
    const players = listPlayers.rows;
    if (!players || !players.length) {
      throw new Error(`Game which has id: ${id} not found`);
    }
    const player = players[0];
    return player;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }
}

async function getAddressAvailableBalance(account) {
  const busyBalance = await getBusyBalance();
  const balance = await getAddressBalance(account);
  return balance.minus(busyBalance);
}

async function getBusyBalance() {
  const games = await getAllUnFinished();
  let balance = new BigNumber(0);
  games.forEach(game => {
    console.log('game')
    console.log(game)
    const totalFee = new BigNumber(game.feeJoin).multipliedBy(game.numberPlayers);
    const totalMaybeLose = new BigNumber(game.feeJoin).multipliedBy(game.priceRatio).dividedBy(100);
    console.log(totalMaybeLose.toNumber())
    console.log(totalFee.toNumber())

    balance = balance.plus(totalFee).plus(totalMaybeLose);
  })
  return balance;
}

async function getOneGameDetail(gameId) {
  const game = await this.getOneGame(gameId);
  return game;
}

async function standardizeGame(game) {
  game.feeJoin = new BigNumber(game.feeJoin).dividedBy(new BigNumber(10).pow(process.env.SCALE)).toFixed(parseInt(process.env.SCALE));
  const players = await getPlayersGame(game.id);
  game.joinedPlayer = players.length;
  return game;
}

async function getPlayerGames(user) {
  try {
    const listgames = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.playerTable,        // Table name
      table_key: Const.playerColumn,           // Table secondary key name
      lower_bound: user,     // Table primary key value
      upper_bound: user,
      index_position: 2,
      key_type: "name",
      limit: 10,                   // Here we limit to 1 to get only the single row with primary key equal to 'testacc'
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!listgames) {
      throw new Error(`Game which has id: ${gameId} not found`);
    }
    const players = listgames.rows;
    return players;
  } catch (e) {
    throw new Error(e.message ? e.message : e);
  }    
}

module.exports = {
  init,
  getAllGame,
  getAllUnStarted,
  getAllFinished,
  sendToken,
  commit,
  reveal,
  endGame,
  startCommit, 
  startReveal,
  getOneTx,
  getOneGame,
  join,
  sendTx,
  cancel,
  getPlayersGame,
  getAddressAvailableBalance,
  getAddressBalance,
  getOnePlayer,
  getBusyBalance,
  getOneGameDetail,
  revealFull,
  getPlayerGames
}