const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');
router.get('/games/all', async (req, res) => {
  try {
    const page = req.query.page;
    const result = await eosService.getAllGame({ page });
    return res.json({result: result.result,
    more: result.more });
  } catch (e) {
    return res.status(500).send({Error: e.toString()});
  }
});
  
router.get('/games/unstarted', async (req, res) => {
  try {
    return res.json({result: await eosService.getAllUnStarted()});
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/games/finished', async (req, res) => {
  try {
    return res.json({result: await eosService.getAllFinished()});
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});
  
router.get('/games/get_tx', async (req, res) => {
  try {
    const id = req.query.id;
    return res.json({result: await eosService.getOneTx(id)});
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/games/get_one_game', async (req, res) => {
  try {
    const id = req.query.id;
    return res.json({result: await eosService.getOneGameDetail(id)});
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/games/get_one_player', async (req, res) => {
  try {
    const id = req.query.id;
    return res.json({result: await eosService.getOnePlayer(id)});
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/games/players', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).send({Error: `Bad params`});
    }
    return res.json({result: await eosService.getPlayersGame(id)});
  } catch (e) {
    return res.status(500).send({Error: e.toString()});
  }
});

router.get('/account/balance', async (req, res) => {
  try {
    const account = req.query.account;
    if (!account) {
      return res.status(400).send({Error: `Bad params`});
    }
    return res.json({ result: { balance: (await eosService.getAddressBalance(account)).toNumber()} });
  } catch (e) {
  return res.status(500).send({Error:   e.toString()});
  }
});

router.get('/account/busy_balance', async (req, res) => {
  try {
    const account = req.query.account;
    if (!account) {
      return res.status(400).send({Error: `Bad params`});
    }
    return res.json({ result: { balance: (await eosService.getBusyBalance(account)).toNumber()} });
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/account/reliable_balance', async (req, res) => {
  try {
    const account = req.query.account;
    if (!account) {
      return res.status(400).send({Error: `Bad params`});
    }
    return res.json({ result: { balance: (await eosService.getAddressAvailableBalance(account)).toNumber()} });
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

router.get('/account/balance/all', async (req, res) => {
  try {
    console.log('kdsjfkljsdlkfjl')
    const account = req.query.account;
    if (!account) {
      return res.status(400).send({Error: `Bad params`});
    }
    const [balance, busyBalance] = await Promise.all([
      eosService.getAddressBalance(account),
      eosService.getBusyBalance(account)
    ])
    console.log(busyBalance)
    return res.json({ result: {
        balance: balance ? balance.toNumber() : 0,
        busyBalance: busyBalance ? busyBalance.toNumber(): 0 
      }  
    });
  } catch (e) {
    console.error(e)  
  return res.status(500).send({Error:   e.toString()});
  }
});

router.get('/account/games', async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) {
      return res.status(400).send({Error: `Bad params`});
    }
    return res.json({ result: (await eosService.getPlayerGames(user)) });
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});
module.exports = router;