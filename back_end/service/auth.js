const crypto = require('crypto');
const verify = crypto.createVerify('SHA256');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken'); //we're using 'express-session' as 'session' here
const client = require('./redisClient');

async function checkHash(pass) {
  return await bcrypt.compare(pass, process.env.PASS_HASH);
}
async function authenticate(name, pass) {
    if (name !== process.env.GAME_USERNAME) {
      throw new Error(`Invalid user: ${name}`)
    }
    if (!checkHash(pass)) {
      throw new Error('Invalid password')
    }
    return createToken(process.env.GAME_USERNAME, process.env.ID);
}

function createToken(user, id) {
  const userData = {
    username: user,
    _id: id  
  }
  const payload = {
    username: userData.username,
    id: userData._id
  }
  // 2. then we use jwt to sign our payload with our secret defined on line 23
  let token = jwt.sign(payload, process.env.TOKEN_SECRET);
  // 3. lastly we send the token and some other info we feel clients might need to them in form of response
  return { token, username: userData.username };
}

function requiresLogin(req, res, next) {
  // return next();
  var token = req.headers['x-access-token'] || req.body.token
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (!err) {
        req.decoded = decoded; // this add the decoded payload to the client req (request) object and make it available in the routes
        next();
      } else {
        return res.status(403).send({ Error: 'Invalid token supplied'});
      }
    })
  } else {
    return res.status(403).send({ Error: 'Authorization failed! Please provide a valid token' });
  }  
  // if (req.session && req.session.userId) {
  //   return next();
  // } else {
  //   var err = new Error('You must be logged in to view this page.');
  //   err.status = 401;
  //   return next(err);
  // }
}

async function requireJoined(req, res, next) {
  var token = req.headers['x-access-token'] || req.body.token
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (!err) {
        // TODO using redis
        req.decoded = decoded; // this add the decoded payload to the client req (request) object and make it available in the routes
        if (!client.get(decoded.id)) {
          return res.status(403).send({ Error: 'Invalid token supplied'});
        }
        next();
      } else {
        return res.status(403).send({ Error: 'Invalid token supplied'});
      }
    })
  } else {
    return res.status(403).send({ Error: 'Authorization failed! Please provide a valid token'});
  }  
}
module.exports = {
  authenticate,
  requiresLogin,
  createToken,
  requireJoined
}