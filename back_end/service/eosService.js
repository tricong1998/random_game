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
const util = require('./util');

async function join(from, gameId, pv) {
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

    console.log(players)

    if (players.length >= game.numberOfPlayers) {
      throw new Error(`Game has had sufficient players`);
    }

    if (players.find(_player => _player.user === from)) {
      throw new Error(`Player has already joined game`);
    }
    console.log(from)
    const result = await sendToken(from, game.admin, game.feeJoin, gameId, pv);
    await countTime.delay(1000);
    players = await getPlayersGame(gameId);
    console.log(players);

    const player = players.find(_player => {
      return _player.user === from;
    });
    console.log(player);
    if (!player) {
      throw new Error (`Join fail`)
    }
    const token = auth.createToken(from, player.id);
    return {
      result,
      token
    }
  } catch (e) {
    throw new Error(e);
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
    throw new Error(e);
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
    console.error(e);
    // console.log('\nCaught exception: ' + e);
    if (e instanceof RpcError)
      console.error(JSON.stringify(e.json, null, 2));
    throw new Error(e);
  }

}

async function init(numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio) {
  const newFee = parseInt(new BigNumber(feeJoin).multipliedBy(new BigNumber(10).pow(process.env.SCALE)).toFixed(0));
  const from = process.env.ACCOUNT_RANDOM;
  const balance = await getAddressAvailableBalance(from);
  const maxAmountLoss = new BigNumber(feeJoin).multipliedBy(numberOfPlayers).multipliedBy(priceRatio);
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
    client.set(Const.prefixGameSecret + activeKeyHash, activeKey);
    return {
      result,
      activeKey,
    }
    // if (result) {
      // const game = await getOneGame()
    // }
    // countTime.callStartCommit()
  } catch (e) {
    throw new Error(e);
  }}

async function commit(user, hashSecret, playerId) {
  const game = await getOneGame(gameId);

  if (!game) {
    throw new Error(`Game is not exist`);
  }

  if (game.state !==  Const.gameCommitState) {
    throw new Error(`Game is not in commit state`);
  }

  const players = await getPlayersGame(gameId);
  const player = players.find(_player => players.user === user);
  if (!player) {
    throw new Error(`Player didn't join game`);
  }

  if (player.isCommit) {
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
    return await sendTx(actions, pv);
  } catch (e) {
    throw new Error(e);
  }}

async function startCommit(gameId) {
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
    countTime.callAfterStartCommit(game);
    return {
      result,
    }
  } catch (e) {
    throw new Error(e);
  }
}

async function startReveal(gameId, secret) {
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
    return await sendTx(actions, pv);
  } catch (e) {
    throw new Error(e);
  }
}

async function reveal(playerId, secret) {
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
  return await sendTx(actions, pv); 
}

async function endGame(gameId) {
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
    return await sendTx(actions, pv);
  } catch (e) {
    throw new Error(e);
  }
}

async function cancel(gameId, playerId) {
  const from = process.env.ACCOUNT_RANDOM;
  const pv = process.env.PV;
  const game = await getOneGame(gameId);

  if (game.state !== Const.gameJoinState) {
    throw new Error(`Game is not in join state!`);
  }

  const players = await getPlayersGame(gameId);
  if (players.length >= game.numberOfPlayers) {
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
    return await sendTx(actions, pv);
  } catch (e) {
    throw new Error(e);
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
    const game = games[0];
    game.feeJoin = new BigNumber(game.feeJoin).dividedBy(new BigNumber(10).pow(process.env.SCALE)).toFixed(parseInt(process.env.SCALE));
    return game;
  } catch (e) {
    throw new Error(e);
  }
}

async function getPlayersGame(gameId) {
  console.log(gameId)
  if (typeof gameId === 'string') {
    gameId = parseInt(gameId);
  }
  console.log(gameId)
  try {
    const listgames = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.playerTable,        // Table name
      table_key: Const.gameIdColumn,           // Table secondary key name
      lower_bound: gameId,     // Table primary key value
      // upper_bound: gameId,
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
    return players
    // .filter(_player => {
    //   console.log(_player.gameId)
    //   return _player.gameId === gameId;
    // });
  } catch (e) {
    throw new Error(e);
  }  
}

async function getAllGame() {
  try {
    const games = await rpc.get_table_rows({
      json: true,               // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      limit: 10,                // Maximum number of rows that we want to get
      reverse: false,           // Optional: Get reversed data
      show_payer: false          // Optional: Show ram payer
    });
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    return games.rows;
  } catch (e) {
    throw new Error(e);
  }
}

async function getAllUnStarted() {
  try {
    const games = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      table_key: Const.stateColumn,           // Table secondary key name
      lower_bound: 1,            // Table secondary key value
      limit: 10,                   // Here we limit to 1 to get only row
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    })
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    return games.rows;
  } catch (e) {
    throw new Error(e);
  }
}

async function getAllFinished() {
  try {
    const games = await rpc.get_table_rows({
      json: true,                 // Get the response as json
      code: process.env.ACCOUNT_RANDOM,      // Contract that we target
      scope: process.env.ACCOUNT_RANDOM,         // Account that owns the data
      table: Const.gameTable,        // Table name
      table_key: Const.stateColumn,           // Table secondary key name
      lower_bound: 4,            // Table secondary key value
      limit: 10,                   // Here we limit to 1 to get only row
      reverse: false,             // Optional: Get reversed data
      show_payer: false,          // Optional: Show ram payer
    });
    if (!games || !games.rows) {
      throw new Error(`Server error`);
    }
    return games.rows;
  } catch (e) {
    throw new Error(e);
  }
}

async function getOneTx(txId) {
  try {
    const tx = await rpc.history_get_transaction(txId);
    return util.standardizedTx(tx);
  } catch (e) {
    throw new Error(e);
  }
}

async function getAddressBalance(account) {
  console.log(`come here`);
  console.log(process.env.CODE, account, process.env.TOKEN_NAME)
  const balances = await rpc.get_currency_balance(process.env.CODE, account, process.env.TOKEN_NAME);
  console.log(balances)
  if (!balances.length) {
    throw new Error(`Account has insufficient balance`);
  }
  // if (new BigNumber(arr[0]).gt(game.feeJoin)) {
  //   throw new Error(`Account has insufficient balance`);
  // }
  console.log(typeof balances)
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
      table: Const.gameTable,        // Table name
      lower_bound: id,     // Table primary key value
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
    throw new Error(e);
  }
}

async function getAddressAvailableBalance(account) {
  const busyBalance = await getBusyBalance();
  const balance = await getAddressBalance(account);
  return balance.minus(busyBalance);
}

async function getBusyBalance() {
  const allGames = await getAllGame();
  const finishedGames = await getAllFinished();
  const games = allGames.filter(_game => !finishedGames.find(__game => __game.id === _game.id));
  let balance = new BigNumber(0);
  games.forEach(game => {
    balance.plus(new BigNumber(game.feeJoin).multipliedBy(game.numberOfPlayers));
  })
  return balance;
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
  getBusyBalance
}