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
              gradePicksPromises.push(calc.didParlayBetWin(resolved[i]))
            }else{
              gradePicksPromises.push(calc.didSingleGameBetWin(resolved[i].pick, resolved[i].game))
            }

          }
          Promise.all(gradePicksPromises).then(function(pickResults){
            console.log('done grading ',pickResults.length,' picks')

            var picksKey = 'week:' + calc.getCurrentWeek() + ':results'
            console.log(picksKey)

            var userArray =[]
            var scoresArray = []
            /*
            calculateCreditChange, and appending to the pickResult
            creating a scoresArray based on the credit change
            */

            for(var i=0; i<pickResults.length; i++){
              console.log(pickResults[i].userName)
              var p = pickResults[i]
              var creditChange = calc.calculateCreditChange(p)
              // console.log('Scoring ', i+1, '/', pickResults.length,  ' ', p.userName, ' ',creditChange)
              var userArrayPosition = userArray.indexOf(p.userName)
              if(userArrayPosition==-1){
                userArray.push(p.userName)
                userArrayPosition = userArray.indexOf(p.userName)
                scoresArray[userArrayPosition] = creditChange
              }else{
                scoresArray[userArrayPosition] = scoresArray[userArrayPosition] + creditChange
              }
              pickResults[i].creditChange = creditChange

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
              console.log(prettyPrint)
              pickResults[i].prettyPrint = prettyPrint
            }
            var prevWeekNum = calc.getCurrentWeek() - 1
            var previousWeekCreditsKey = 'week:' + prevWeekNum + ':credits'
            redisManager.getList(previousWeekCreditsKey, function(value, error){

              // console.log(previousWeekCreditsKey,' ',value)

              var weekCreditsKey = 'week:' + calc.getCurrentWeek() + ':credits'
              console.log('userArray:', userArray)
              for(var i=0; i<userArray.length; i++){
                console.log(userArray[i], ' ', scoresArray[i])
                console.log(value.length)
                var prevWeekCredits = 0
                for(var t=0; t<value.length; t++){
                  var valueJson = JSON.parse(value[t])
                  if(valueJson.userName==userArray[i]){
                    prevWeekCredits = valueJson.creditAmount
                    break;
                  }
                }
                console.log('previous credit for ', userArray[i], ': ', prevWeekCredits)
                console.log('this week ', userArray[i], ': ', scoresArray[i])
                var newCredits = prevWeekCredits + scoresArray[i]
                var entry = {userName: userArray[i], creditAmount: newCredits}
                console.log(entry)
                // redisManager.addToList(weekCreditsKey,JSON.stringify(entry))
              }
            })
            console.log('im out')

            for(var i=0; i<pickResults.length; i++){
              var p = pickResults[i]
              // redisManager.addToList(picksKey,JSON.stringify(p))
            }
            res.send(pickResults)
          })
        })
      })
    })
  })

  // res.send('done')
})


app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/main.html"));
});

app.listen(process.env.PORT || 9090);
