const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');
router.get('/games/all', async (req, res) => {
  try {
    return res.json({result: await eosService.getAllGame()});
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

router.get('/games/finishes', async (req, res) => {
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
    return res.json({result: await eosService.getOneGame(id)});
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
    return res.json({ result: (await eosService.getAddressBalance(account)).toNumber() });
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
    return res.json({ result: (await eosService.getBusyBalance(account)).toNumber() });
  } catch (e) {
  return res.status(500).send({Error: e.toString()});
  }
});

module.exports = router;