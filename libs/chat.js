//Code needs to be moved here from app.js
var events = require('events');
var mongoose = require('mongoose');
var eventEmitter = new events.EventEmitter();
var models_path = __dirname + '/app/models/'
require("../app/models/messageModel.js");
var MessageModel = mongoose.model('Message');

module.exports.sockets = function(io) {
    io.on('connection', function (socket) {
    //Identify the user
    socket.on('user', function (data) {
        socket.broadcast.emit('chat message', data + ' has come online');
        //Allocate Variable in socket
        socket.user = data;
    });
    socket.on('logout', function (data) {
        console.log("Inside");
        socket.broadcast.emit('chat message', data + ' has gone offline');

    });
    // socket.broadcast.emit('chat message', 'A new user has just joined the chat');
    socket.on('chat message', function (msg) {
        //Save the Message
        eventEmitter.emit('saveMessage', msg, socket.user);
        io.emit('chat message', msg, socket.user);

    });

    //Typing Socket
    socket.on('typing', function (data, flag) {
        if (flag)
            socket.broadcast.emit('type message', data + ' typing');
        else
            socket.broadcast.emit('type message', '');
    });

    socket.on('disconnect', function () {

        socket.broadcast.emit('chat message', socket.user + ' has gone offline');

    }); //end socket disconnected
});

//Save the Record
eventEmitter.on('saveMessage', function (msg, user) {
    console.log(msg);
    console.log(user);
    var messageModel = new MessageModel({
        userName: user,
        message: msg
    });

    messageModel.save(function (err) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Message Inserted successfully");
        }
    })
});

}