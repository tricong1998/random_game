const express = require('express');
const router = express.Router();
const eosService = require('../service/eosService');
const auth = require('../service/auth');

module.exports = (io) => {
  router.post('/join', async (req, res) => {
    try {
      const pv = req.body.privateKey;
      const account = req.body.account;
      const gameId = req.body.gameId;
      console.log(pv, account, gameId)
      if (!pv || !account || (!gameId && typeof gameId !== 'number') || gameId === undefined) {
        return res.status(400).send({Error: `Bad params!`});
      }
      return res.send(await eosService.join(account, gameId, pv, io));
    } catch (e) {
      console.error(e);
      return res.status(500).send(`Server Error: ${e}`);
    }
  });
  
  router.post('/commit', auth.requireJoined, async (req, res) => {
    try {
      const account = req.body.account;
      const playerId = req.body.playerId;
      const secret = req.body.secret;
      if (!account || playerId === null || playerId === undefined || !secret) {
        return res.status(400).send({Error: `Bad params!`});
      }
      return res.send(await eosService.commit(account, playerId, secret, io));
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
      return res.send(await eosService.cancel(gameId, io));
    } catch (e) {
      console.error(e);
      return res.status(500).send({Error: e.toString()});
    }
  });  
  return router;
};