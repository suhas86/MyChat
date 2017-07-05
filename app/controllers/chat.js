var mongoose = require('mongoose');
var express = require('express');
//Express Router used to define routes
var chatRouter = express.Router();
var responseGenerator = require('./../../libs/responseGenerator');
var auth = require('./../../middlewares/auth');
var path = require('path');
var fs = require('fs');
var messageModel=mongoose.model('Message');

module.exports.controller=function(app){
    chatRouter.get('/screen',auth.checkLogin,function(req,res){
        res.sendFile(path.join(__dirname, '../views', 'chat.html'));
    });

    //Get  Chat List

    chatRouter.get('/list',function(req,res){
        messageModel.find(function(err,messages){
            if(err){
                var myResponse = responseGenerator.generate(true,
                        "Oops something went wrong " + err, 500, "");
                    res.send(myResponse);
            }else{
                var myResponse = responseGenerator.generate(false, null, 200, messages);
                res.send(myResponse);
            }
        });
    });


    app.use('/chat',chatRouter);
}