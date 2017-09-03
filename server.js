var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var redisManager = require('./app/redisManager')
var http = require('http')
var utils = require('./app/pickUtils')
var calc = require('./app/calc')

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
      userName: req.body.userName,
      password: req.body.passwordOne,
      email: req.body.email
    }
    redisManager.setKeyValue(key, JSON.stringify(value))

    var userCredits = {
      userName: req.body.userName,
      creditAmount: 2500
    }
    redisManager.addToList('user:credits', JSON.stringify(userCredits))

    var transaction = {
      event: 'register',
      serverTimestamp: new Date(),
      ipAddress: req.ip,
      log: req.body
    }
    redisManager.addToList('transactions', JSON.stringify(transaction))

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

    var transaction = {
      event: 'authenticate',
      serverTimestamp: new Date(),
      ipAddress: req.ip,
      log: req.body
    }
    redisManager.addToList('transactions', JSON.stringify(transaction))
});

app.get('/getPicks', function(req, res, next) {
    console.log('picks:',req.query)
    redisManager.getList('user:'+ req.query.userName +':picks', function(value, error){
      console.log('value:',value)
      console.log('error:',error)
      if(!error){
        res.send(value)
      }else{
        res.status(500).send(value)
      }
    })
});

app.get('/getCredits', function(req, res, next) {
    console.log('testCreds:',req.query)
    redisManager.getList('user:credits', function(value, error){

        if(req.query.userName){
          for(i=0; i<value.length; i++){
            var parsedValue = JSON.parse(value[i])
            if(parsedValue.userName===req.query.userName){
              res.send(parsedValue)
            }
          }
        }else{
          res.send(value)
        }
    })
});

app.get('/getServerTime', function(req, res, next) {
    console.log('getServerTime')
    var now = new Date()
    res.send(now)
});

app.post('/makePick', function(req, res, next) {
    console.log('picks:',req.body)
    var key = 'user:'+ req.body.userName +':picks';

    var response = utils.hasGameStarted(req.body)
    if(response == 'NO'){
      redisManager.addToList(key, JSON.stringify(req.body))
      res.send('pick made')
    }else{
      res.status(500).send(response)
    }

    var transaction = {
      event: 'makePick',
      serverTimestamp: new Date(),
      ipAddress: req.ip,
      log: req.body
    }
    redisManager.addToList('transactions', JSON.stringify(transaction))
});


app.post('/deletePick', function(req, res, next) {
    console.log('pick to delete:',req.body)
    var key = 'user:'+ req.body.userName +':picks';

    var response = utils.hasGameStarted(req.body)
    if(response == 'NO'){
      redisManager.removeFromList(key, JSON.stringify(req.body))
      res.send('pick deleted')
    }else{
      res.status(500).send(response)
    }

    var transaction = {
      event: 'deletePick',
      serverTimestamp: new Date(),
      ipAddress: req.ip,
      log: req.body
    }
    redisManager.addToList('transactions', JSON.stringify(transaction))
});

app.get('/test', function(req, res, next) {

  calc.getGamesFeed.then(function(games){
    console.log('we have ', games.length, ' games today')
    redisManager.getUserPicksKeys(function(userPickKeys, error){
      console.log('we have ', games.length, ' games today')
      console.log('we have ', userPickKeys.length, ' users')

      var getUserPicksPromises = []
      for(var i=0; i<userPickKeys.length; i++){
        getUserPicksPromises.push(calc.getUserPicks(userPickKeys[i]))
      }
      Promise.all(getUserPicksPromises).then(function(userPicksArray){

        var findGameForPickPromises = []
        for(var i=0; i<userPicksArray.length; i++){
          for(var x=0; x<userPicksArray[i].picks.length; x++){
            var pickJson = JSON.parse(userPicksArray[i].picks[x])
            if(pickJson.pickType == 'parlay'){
                findGameForPickPromises.push(calc.findGamesForParlay(pickJson, games))
            }else{
                findGameForPickPromises.push(calc.findGameForPick(pickJson, games))
            }
          }
        }
        Promise.all(findGameForPickPromises).then(function(resolved){
          console.log('done finding games for this many ', resolved.length)

          var gradePicksPromises = []
          for(var i=0; i<resolved.length; i++){
            if(resolved[i] instanceof Array){
              gradePicksPromises.push(calc.didParlayBetWin(resolved[i]))
            }else{
              gradePicksPromises.push(calc.didSingleGameBetWin(resolved[i].pick, resolved[i].game))
            }

          }
          Promise.all(gradePicksPromises).then(function(pickResults){
            console.log('done grading everything')
            console.log(pickResults.length)
            // console.log(pickResults)
            for(var i=0; i<pickResults.length; i++){
              var p = pickResults[i]
              if (typeof p != 'undefined' && p!=null){
                //console.log(p)
                console.log(p.betResult, p.userName, p.wagerAmount)
              }

            }
          })
        })
      })
    })
  })

  res.send('done')
})


app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/main.html"));
});

app.listen(process.env.PORT || 9090);
