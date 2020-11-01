var express = require('express');
var passport = require('passport');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

router.post('/signup', (req, res) => {
  console.log("hola");
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        passport.authenticate('local')(req, res, () => {    // To finish registration, check if the 
          res.statusCode = 200;                             // new User can be authenticated correctly
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' })
        })
      }
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => { // If can't call passport.authenticate('local')
  res.statusCode = 200;                                               // send a error to client and abort login       
  var token = authenticate.getToken({_id: req.user._id}); // when login 1st time correctly, create the token
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'}); //and send back inside request
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
