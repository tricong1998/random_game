const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');
const BigNumber = require('bignumber.js');

module.exports = (io) => {
  router.post('/init', async (req, res) => {
    try {
      let {numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio} = req.body;
      expireCommitTime = typeof expireCommitTime  === 'string' ? parseInt(expireCommitTime) : expireCommitTime;
      console.log(expireCommitTime);
      expireJoinTime = typeof expireJoinTime  === 'string' ? parseInt(expireJoinTime) : expireJoinTime;
      numberOfPlayers = typeof numberOfPlayers  === 'string' ? parseInt(numberOfPlayers) : numberOfPlayers;
      feeJoin = typeof feeJoin  === 'string' ? parseFloat(feeJoin) : feeJoin;
      priceRatio = typeof priceRatio  === 'string' ? parseInt(priceRatio) : priceRatio;
  
      if (!numberOfPlayers || !feeJoin || !expireCommitTime || !expireJoinTime || !priceRatio) {
        return res.status(400).send({Error: `Bad params!`});
      }
      if (new BigNumber(expireCommitTime).lt(30)) {
        return res.status(400).send({Error: `Expire Commit Time: ${expireCommitTime} must be greater or equal 30`});
      }
  
      if (new BigNumber(expireJoinTime).lt(120)) {
        return res.status(400).send({Error: `Expire Commit Time: ${expireJoinTime} must be greater or equal 120`});
      }
      const result = await eosService.init(numberOfPlayers, feeJoin, expireCommitTime, expireJoinTime, priceRatio, io);
      return res.send(result);
    } catch (e) {
      console.error(e);
      return res.status(500).send({Error: e.message ? e.message : e.toString()});
    }
  });
  
  router.post('/start_commit', async (req, res) => {
    try {
      const gameId = req.body.gameId;
      if (!gameId) {
        return res.status(400).send({Error: `Bad params!`});
      }
      const result = await eosService.startCommit(gameId, io);
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
      const result = await eosService.startReveal(gameId, secret, io);
      return res.send(result);
    } catch (e) {
      console.error(e);
      return res.status(500).send({Error: e.toString()});
    }
  });
  
  router.post('/reveal_full', async (req, res) => {
    try {
      const gameId = req.body.gameId;
      if (!gameId) {
        return res.status(400).send({Error: `Bad params!`});
      }
      const result = await eosService.revealFull(gameId, io);
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
      const result = await eosService.reveal(playerId, secret, io);
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
      const result = await eosService.cancel(gameId, io);
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
      const result = await eosService.endGame(gameId, io);
      return res.send(result);
    } catch (e) {
      console.error(e);
      return res.status(500).send({Error: e.toString()});
    }
  });
  return router;
};