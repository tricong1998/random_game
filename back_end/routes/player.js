const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');
const auth = require('../service/auth');

router.post('/join', async (req, res) => {
  try {
    const pv = req.body.privateKey;
    const account = req.body.account;
    const gameId = req.body.gameId;
    if (!pv || !account || !gameId) {
      return res.status(400).send({Error: `Bad params!`});
    }
    return res.send(await eosService.join(account, gameId, pv));
  } catch (e) {
    console.error(e);
    return res.status(500).send(`Server Error: ${e}`);
  }
});

router.post('/commit', auth.requireJoined, async (req, res) => {
  try {
    const account = req.body.account;
    const hashSecret = req.body.hashSecret;
    const playerId = req.body.playerId;
    if (!account || !hashSecret || playerId === null || playerId === undefined) {
      return res.status(400).send({Error: `Bad params!`});
    }
    return res.send(await eosService.commit(account, hashSecret, playerId));
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/cancel', auth.requireJoined, async (req, res) => {
  try {
    const gameId = req.body.gameId;
    if (!gameId) {
      return res.status(400).send({Error: `Bad params!`});
    }
    return res.send(await eosService.cancel(gameId));
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

module.exports = router;