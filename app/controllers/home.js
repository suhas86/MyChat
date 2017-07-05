var mongoose = require('mongoose');
var express = require('express');
//Express Router used to define routes
var userRouter = express.Router();

var userModel = mongoose.model('User');
var responseGenerator = require('./../../libs/responseGenerator');
var path = require('path');
var fs = require('fs');

module.exports.controller = function (app) {
    userRouter.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
    });

    userRouter.post('/signup', function (req, res) {
        if (req.body.userName != undefined && req.body.email != undefined
            && req.body.password != undefined) {
            var newUser = new userModel({
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password
            });

            newUser.save(function (err) {
                if (err) {
                    var myResponse = responseGenerator.generate(true,
                        "Oops something went wrong " + err, 500, "");
                    res.send(myResponse);
                } else {
                    var myResponse = responseGenerator.generate(false, null, 200, newUser);
                    req.session.user = newUser;
                    delete req.session.user.password;
                    req.user = newUser;
                    delete req.user.password;
                    res.send(myResponse);
                    //res.redirect('/chat/screen');
                }

            });
        } else {
            var myResponse = responseGenerator.generate(true, "Please enter mandatory fields "
                , 403, null);
            res.send(myResponse);
        }

    });

    userRouter.post('/login', function (req, res) {
        if (req.body.email != undefined && req.body.password != undefined) {
            userModel.findOne({ $and: [{ 'email': req.body.email }, { 'password': req.body.password }] },
                function (err, foundUser) {
                    if (err) {
                        var myResponse = responseGenerator.generate(true, "Oops Something Went Wrong " + err,
                            500, null);
                        res.send(myResponse);

                    } else {
                        if (foundUser == null || foundUser == undefined) {
                            var myResponse = responseGenerator.generate(true, "Please check your email and password ",
                                404, null);
                            res.send(myResponse);

                        } else {
                            var myResponse = responseGenerator.generate(false, "",
                                200, foundUser);
                            req.session.user = foundUser;
                            delete req.session.user.password;
                            req.user = foundUser;
                            delete req.user.password;
                            res.send(myResponse);
                           //res.redirect('/chat/screen');
                        }
                    }
                });
        }
    });

    //Logout
    userRouter.get('/logout',function(req,res){
        req.session.user = null;
        res.redirect('/');
      //  res.sendFile(path.join(__dirname, '../views', 'index.html'));

    });

    app.use('', userRouter);
}