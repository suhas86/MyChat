var express = require('express');
var app = express();
//Calling mongoose module
var mongoose = require('mongoose');
var http = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
const PORT=process.env.PORT || 3000;
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


var io = require('socket.io')(http);
require('./libs/chat.js').sockets(io);
// now we are checking for connection

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

http.listen(PORT, function () {
    console.log('Example app listening on port '+PORT);
});

