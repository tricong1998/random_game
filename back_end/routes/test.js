const express = require('express');
const router = express.Router();
const test = require('../service/smartContactService');
router.post('/create_account', async (req, res) => {
  try {
    const newAccount = req.body.newAccount;
    if (!newAccount) {
      return res.status(400).send({ Error: `Bad params` });
    }
    return res.json(await test.createNewAccount(newAccount))
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});  }
})

router.post('/deploy', async (req, res) => {
  try {
    await test.deploy();
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
})

router.post('/issue', (req, res) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
})

router.post('/transfer', async (req, res) => {
  try {
    const to = req.body.to;
    if (!to) {
      return res.status(400).send({ Error: `Bad params` });
    }
    return res.json(await test.transferTo(to));
  } catch (e) {
    console.error(e);
    return res.status(500).send({Error: e.toString()});
  }
})

module.exports = router;