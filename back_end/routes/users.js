var express = require('express');
var router = express.Router();
const auth = require('../service/auth')
/* GET users listing. */
router.post('/login', async function(req, res, next) {
  try {
    return res.status(200).send(await auth.authenticate(req.body.username, req.body.password));
    // req.session.regenerate( () => {
    //   // Store the user's primary key
    //   // in the session store to be retrieved,
    //   // or in this case the entire user object
    //   req.session.userId = process.env.ID;      
    //   // res.redirect('back');
    // });
    // console.log(req.session);
    // res.json('ok');
  } catch (e) {
    return res.status(400).send({ Error: e.toString()});
  }
});

// router.get('/logout', function (req, res, next) {
//   if (req.session) {
//     // delete session object
//     req.session.destroy(function (err) {
//       if (err) {
//         return next(err);
//       } else {
//         return res.redirect('/');
//       }
//     });
//   }
// });

module.exports = router;
