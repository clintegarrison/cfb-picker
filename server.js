var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var redisManager = require('./app/redisManager')

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/app'));

app.post('/register', function(req, res, next) {
    console.log('register:',req.body)
    var key = "user:" + req.body.userName;
    var value = {
      "userName": req.body.userName,
      "password": req.body.passwordOne,
      "email": req.body.email
    }
    redisManager.setKeyValue(key, JSON.stringify(value))
    res.send('registered')
});

app.post('/authenticate', function(req, res, next) {
    console.log('authenticate:',req.body)
    redisManager.getValueByKey('user:'+req.body.userName, function(value, error){
        console.log('value:',value)
        console.log('error:',error)
        if(!error){
          // user found, not validate the passwords match
          if(req.body.password===JSON.parse(value).password){
            res.send("authenticated")
          }else{
            res.status(401).send('Invalid Credentials')
          }
        }else{
          res.status(401).send('User Not Found')
        }
    })
});



app.get('/getKey', function(req, res, next) {
  redisManager.getValueByKey("user:asdfasdfasdfasd", function(value, error){
    console.log('value:',value)
    console.log('error:',error)
    if(!error){
      console.log(value)
      res.send(value)
    }else{
      res.status(401).send('Not Logged In')
    }
  });
});

app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/main.html"));
});

app.listen(process.env.PORT || 9090);
