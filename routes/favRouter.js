const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {   // only authenticate user can do it
        Favorites.findOne({ "user": req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.insertMany({
                        user: req.user._id,
                        dishes: req.body
                    })
                        .then(() => {
                            Favorites.find({ user: req.user._id })
                                .populate('user')
                                .populate('dishes')
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                })
                        }, (err) => next(err));
                }
                else {
                    Favorites.updateOne({ user: req.user._id }, { $set: { "dishes" : req.body }})
                        .then(() => {
                            Favorites.find({ user: req.user._id })
                                .populate('user')
                                .populate('dishes')
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                })
                        }, (err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {   // only authenticate user can do it
        Favorites.deleteMany({ "user": req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {   // only authenticate user can do it
        Favorites.findOne({ "user": req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.insertMany({
                        user: req.user._id,
                        dishes: req.params.dishId
                    })
                        .then(() => {
                            Favorites.find({ user: req.user._id })
                                .populate('user')
                                .populate('dishes')
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                })
                        }, (err) => next(err));
                }
                else {
                    if (favorite.dishes.indexOf(req.params.dishId) == -1) {
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                            .then(() => {
                                Favorites.find({ user: req.user._id })
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    })
                            }, (err) => next(err))
                    }
                    else {
                        var err = new Error(req.params.dishId + ' is already in the favorites list');
                        err.status = 409;
                        return next(err);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "user": req.user._id })
            .then((favorite) => {
                if (favorite.dishes.indexOf(req.params.dishId) != -1) {
                    favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
                    favorite.save()
                        .then(() => {
                            Favorites.findOne({ "user": req.user._id })
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err));
                }
                else {
                    var err = new Error(req.params.dishId + ' not found in the favorites list');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = favRouter;
