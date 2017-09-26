var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var redisManager = require('./app/redisManager')
var http = require('http')
var utils = require('./app/pickUtils')
var calc = require('./app/calc')
var dbManager = require('./app/databaseManager')

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
    redisManager.getList('user:'+ req.query.userName +':picks',function(value, error){

      console.log('value:',value)
      console.log('error:',error)
      if(!error){
        res.send(value)
      }else{
        res.status(500).send(value)
      }
    })
});

app.get('/getAllPicks', function(req, res, next) {
  redisManager.getUserPicksKeys(function(userPickKeys, error){
    var getUserPicksPromises = []
    for(var i=0; i<userPickKeys.length; i++){
      getUserPicksPromises.push(calc.getAllUserPicks(userPickKeys[i]))
    }
    Promise.all(getUserPicksPromises).then(function(userPicksArray){
      res.send(userPicksArray)
    })
  })
});

app.get('/cleanupPicks', function(req, res, next) {
  redisManager.getUserPicksKeys(function(userPickKeys, error){
    var getUserPicksPromises = []
    for(var i=0; i<userPickKeys.length; i++){
      getUserPicksPromises.push(calc.getAllUserPicks(userPickKeys[i]))
    }
    Promise.all(getUserPicksPromises).then(function(userPicksArray){
      var picksToChange = []
      console.log(userPicksArray.length)
      for(var x=0; x<userPicksArray.length; x++){
        var singleUserPicks = userPicksArray[x]
        for(var z=0; z<singleUserPicks.length; z++){
          var p = singleUserPicks[z]
          if(p.pickType != 'parlay'){
            if(p.timestamp.includes("2017-09-19")){
              picksToChange.push(p)
            }
          }else{
            if(p.parlays[0].timestamp.includes("2017-09-19")){
              picksToChange.push(p)
            }
          }
        }

        for(var w=0; w<picksToChange.length; w++){
          var key = 'user:' + picksToChange[w].userName + ':picks'
          var pick = picksToChange[w]
          redisManager.removeFromList(key, JSON.stringify(pick))

          var newPick = picksToChange[w]
          newPick.weekNumber=4

          console.log(newPick)

          redisManager.addToList(key, JSON.stringify(newPick))
        }
      }
      res.send(picksToChange)
    })
  })
});

app.get('/getCredits', function(req, res, next) {
    console.log('testCreds:',req.query)
    redisManager.getList('week:2:credits', function(value, error){

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

app.get('/getCreditsNew', function(req, res, next) {
  var currentWeek = calc.getCurrentWeek()
  var getWeekResultsPromises = []
  for(var i=0; i<currentWeek; i++){
    var week = i + 1
    getWeekResultsPromises.push(calc.getFinalResultsPicks('week:' + week + ':results'))
  }
  Promise.all(getWeekResultsPromises).then(function(weekPickArrays){
      var userArray = []
      var scoresArray = []
      console.log(weekPickArrays.length)
      for(var i=0; i<weekPickArrays.length; i++){
        var pickResults = weekPickArrays[i]
        for(var x=0; x<pickResults.length; x++){
          var p = pickResults[x]
          var userArrayPosition = userArray.indexOf(p.userName)
          if(userArrayPosition==-1){
            userArray.push(p.userName)
            userArrayPosition = userArray.indexOf(p.userName)
            scoresArray[userArrayPosition] = 2500 + p.creditChange
          }else{
            scoresArray[userArrayPosition] = scoresArray[userArrayPosition] + p.creditChange
          }
        }
      }
      var creditsObjArray = []
      for(var i=0; i<userArray.length; i++){
        var obj = {
          userName: userArray[i],
          creditAmount: scoresArray[i]
        }
        creditsObjArray.push(obj)
      }
      res.send(creditsObjArray)
  })

});

app.get('/getServerTime', function(req, res, next) {
    console.log('getServerTime')
    var now = new Date()
    res.send(now)
});

app.get('/getResults', function(req, res, next) {
    if(req.query.weekNumber){
      redisManager.getList('week:'+req.query.weekNumber+':results', function(value, error){
          var weekResults = []
          for(i=0; i<value.length; i++){
            var parsedValue = JSON.parse(value[i])
            weekResults.push(parsedValue)
          }
          res.send(weekResults)
      })
    }else{
      res.send('Please provide a week number')
    }
});

app.get('/getTransactions', function(req, res, next) {
    if(req.query.event){
      redisManager.getList('transactions', function(value, error){
          var weekResults = []
          for(i=0; i<value.length; i++){
            var parsedValue = JSON.parse(value[i])
            if(parsedValue.event==req.query.event){
              weekResults.push(parsedValue)
            }
          }
          res.send(weekResults)
      })
    }else{
      res.send('Please provide an event (makePick, deletePick, etc.)')
    }
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

app.post('/calculateResults', function(req, res, next) {

  calc.getGamesFeed(calc.getCurrentWeek()).then(function(games){
    console.log('we have ', games.length, ' games today')
    redisManager.getUserPicksKeys(function(userPickKeys, error){
      console.log('we have ', userPickKeys.length, ' users')

      var getUserPicksPromises = []
      for(var i=0; i<userPickKeys.length; i++){
        getUserPicksPromises.push(calc.getUserPicks(userPickKeys[i]))
      }
      Promise.all(getUserPicksPromises).then(function(userPicksArray){
        var findGameForPickPromises = []
        var allPicksCount = 0

        for(var i=0; i<userPicksArray.length; i++){

          for(var x=0; x<userPicksArray[i].picks.length; x++){
            allPicksCount = allPicksCount + 1
            var pickJson = userPicksArray[i].picks[x]
            if(pickJson.pickType == 'parlay'){
                findGameForPickPromises.push(calc.findGamesForParlay(pickJson, games))
            }else{
                findGameForPickPromises.push(calc.findGameForPick(pickJson, games))
            }
          }
        }
        console.log('all picks:', allPicksCount)
        Promise.all(findGameForPickPromises).then(function(resolved){
          console.log('done finding games for this many ', resolved.length)

          var gradePicksPromises = []
          for(var i=0; i<resolved.length; i++){
            if(resolved[i] instanceof Array){
              console.log('checking if parlay won')
              gradePicksPromises.push(calc.didParlayBetWin(resolved[i]))
            }else{
              gradePicksPromises.push(calc.didSingleGameBetWin(resolved[i].pick, resolved[i].game))
            }

          }
          Promise.all(gradePicksPromises).then(function(pickResults){
            console.log('done grading ',pickResults.length,' picks')

            var picksKey = 'week:' + calc.getCurrentWeek() + ':results'
            console.log(picksKey)

            //-------START--------
            // Filter out the null games that haven't started yet
            pickResults = pickResults.filter(function(n){ return n != undefined });

            for(var i=0; i<pickResults.length; i++){
              pickResults[i].creditChange = calc.calculateCreditChange(pickResults[i])
            }
            // Append the credit change
            for(var i=0; i<pickResults.length; i++){
              pickResults[i].creditChange = calc.calculateCreditChange(pickResults[i])
            }

            // Append the pretty print result
            for(var i=0; i<pickResults.length; i++){
              var p = pickResults[i]
              var prettyPrint = ''
              if(p.pickType=='parlay'){
                prettyPrint = p.parlayGamCount + ' game parlay for ' + p.wagerAmount + '\n'
                for(var x=0; x<p.games.length; x++){
                  prettyPrint += '    ' + calc.prettyPrintPick(p.games[x])
                  if(x+1!=p.games.length) {
                    prettyPrint += '\n'
                  }
                }
              }else{
                prettyPrint = calc.prettyPrintPick(p)
              }
              // console.log(prettyPrint)
              pickResults[i].prettyPrint = prettyPrint
            }

            // Record the final result
            for(var i=0; i<pickResults.length; i++){
              redisManager.addToList(picksKey,JSON.stringify(pickResults[i]))
            }

            res.send(pickResults)
          })
        })
      })
    })
  })
})









app.get('/dbTest', function(req, res, next) {
    dbManager.query('SELECT user_name FROM users').then(function(result){
      res.send(result)
    })
});


app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/main.html"));
});

app.listen(process.env.PORT || 9090);
