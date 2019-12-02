const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');

router.post('/init', async (req, res) => {
  try {
    const {numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio} = req.body;
    if (!numberOfPlayers || !feeJoin || !expireCommitTime || !expireJoinTime || !priceRatio) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.init(numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/start_commit', async (req, res) => {
  try {
    const gameId = req.body.gameId;
    if (!gameId) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.startCommit(gameId);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/start_reveal', async (req, res) => {
  try {
    const gameId = req.body.gameId;
    const secret = req.body.secret;
    if (!gameId || !secret) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.startReveal(gameId,secret);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/reveal', async (req, res) => {
  try {
    const secret = req.body.secret;
    const playerId = req.body.playerId;
    if (!secret || !playerId) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.reveal(playerId, secret);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/cancel', async (req, res) => {
  try {
    const gameId = req.body.gameId;
    if ((typeof gameId === "number" && gameId < 0) || (typeof gameId !== 'number' && !gameId)) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.cancel(gameId);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

router.post('/end_game', async (req, res) => {
  try {
    const gameId = req.body.gameId;
    if (!gameId) {
      return res.status(400).send({Error: `Bad params!`});
    }
    const result = await eosService.endGame(gameId);
    return res.send(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
});

module.exports = router;