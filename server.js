var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/app'));

app.post('/register', function(req, res, next) {
    console.log('register:',req.body)
    res.send('registered')
});

app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/index.html"));
});

app.listen(process.env.PORT || 9090);
