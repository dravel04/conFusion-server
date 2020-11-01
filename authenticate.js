var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');


exports.local = passport.use(new LocalStrategy(User.authenticate()));  //Use passport-local-mongoose autenticate function
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {  // create the token and sign it
    return jwt.sign(user, config.secretKey, 
        {expiresIn: 3600}); // in seconds
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // in the authorization header search token
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);    // have error in the query
            }
            else if (user) {
                return done(null, user);    // no error, user exist
            }
            else {
                return done(null, false); // no error, but user doesn't exist
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false}); // Use JWT but dont create sessions