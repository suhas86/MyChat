var express = require('express');
var app = express();
//Calling mongoose module
var mongoose = require('mongoose');
var http = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

//Define the configuration of the database
var dbPath = "mongodb://localhost/chattest";

//Command to connect with database
db = mongoose.connect(dbPath);

mongoose.connection.once('open', function () {
    console.log("Database connection open success");
});

// module for maintaining sessions
var session = require('express-session');
app.use(session({
    name: 'myCustomCookie',
    secret: 'myAppSecret',
    resave: true,
    httpOnly: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//Chat Code Starts here
var events = require('events');

var eventEmitter = new events.EventEmitter();
var models_path = __dirname + '/app/models/'
require("./app/models/messageModel.js");
var MessageModel = mongoose.model('Message');

var io = require('socket.io')(http);
// now we are checking for connection
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
//Chat Code Ends Here
//fs module, by default module for file management 
var fs = require('fs');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Include all our models
fs.readdirSync('./app/models').forEach(function (file) {
    //Check if file is JS format
    if (file.indexOf('.js')) {
        require('./app/models/' + file);
    }
}); //End For Each

//Include Controllers
fs.readdirSync('./app/controllers').forEach(function (file) {
    if (file.indexOf('.js')) {
        //Include a file as a route variable
        var route = require('./app/controllers/' + file);
        //Call Controller function of each file and pass
        //your app instance to it
        route.controller(app);
    }
}); //End For Each

//app level middleware for setting logged in user.
var userModel = mongoose.model('User');

app.use(function (req, res, next) {
    if (req.session && req.session.user) {
        userModel.findOne({ 'email': req.session.user.email }, function (err, user) {

            if (user) {
                req.user = user;
                delete req.user.password;
                req.session.user = user;
                delete req.session.user.password;
                next();
            }

        });
    }
    else {
        next();
    }

});//end of user login

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

