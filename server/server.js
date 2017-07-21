var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')

app.use(cookieParser());

app.get('/', function(req, res) {
    console.log(req.cookies)
    // check if client sent cookie
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.resolve(".") + '/client/authenticate.html')
    // if (cookie === undefined)
    // {
    //   // no: set a new cookie
    //   // res.cookie('authenticatedUser','youAreYou', { maxAge: 900000, httpOnly: true });
    //   // console.log('cookie created successfully');
    //   res.sendFile(path.resolve(".") + '/client/authenticate.html');
    // }
    // else
    // {
    //   // yes, cookie was already present
    //   console.log('cookie exists', cookie);
    //   res.sendFile(path.resolve(".") + '/client/index.html');
    // }
});

app.post('/register', function(req, res) {
})

app.use(express.static(path.resolve(".") + '/client'));

app.listen(9090);
