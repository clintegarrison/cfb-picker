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

      var promises = []
      for(var i=0; i<userPickKeys.length; i++){
        promises.push(calc.getUserPicks(userPickKeys[i]))
      }
      Promise.all(promises).then(function(userPicksArray){
        console.log('we have ', games.length, ' games today')
        for(var x=0; x<userPicksArray.length; x++){
          console.log(userPicksArray[x].userName, ' has ', userPicksArray[x].picks.length, ' picks!')
          for(var z=0; z<userPicksArray[x].picks.length; z++){
            calc.findGameForPick(userPicksArray[x].picks[z], games).then(function(resolved){
              console.log('about to call didBetWin')
              calc.didBetWin(resolved.pick, resolved.game)
            })
          }
        }
      })
    })
  })

  res.send('done')
})

// app.get('/calculateResults', function(req, res, next) {
//     console.log('calculateResults START')
//
//     // calc.getGamesFeed.then(function(games){
//     //   redisManager.getUserPicksKeys(function(userPickKeys, error){
//     // })
//         //console.log('GAMES:',games)
//
// //{"pickType":"parlay","pickAmount":50,"userName":"btaff","parlays":[{"pickType":"totals","pickTeam":"Rice","pickNumber":"OVER 51.5","opponentTeam":"Stanford","opponentNumber":"UNDER 51.5","userName":"btaff","timestamp":"2017-08-26T03:15:21.497Z","$$hashKey":"object:1867"},{"pickType":"spread","pickTeam":"San Jose State","pickNumber":"+22","opponentTeam":"South Florida","opponentNumber":"-22","userName":"btaff","timestamp":"2017-08-26T03:15:46.497Z","$$hashKey":"object:2238"}]}
//
// //{"pickType":"spread","pickTeam":"Stanford","pickNumber":"-30.5","opponentTeam":"Rice","opponentNumber":"+30.5","userName":"RyanBarksdale","timestamp":"2017-08-26T03:53:02.686Z","pickAmount":110,"weekNumber":1}
//
//         redisManager.getUserPicksKeys(function(userPickKeys, error){
//           for(var i=0; i<userPickKeys.length; i++){
//             console.log('getting picks for: ', userPickKeys[i])
//             redisManager.getList(userPickKeys[i], function(picks, error){
//               console.log(picks)
//               var jsonPicks = JSON.parse(picks)
//
//               //console.log(jsonPicks[0].userName, ' has made ', jsonPicks.length, ' picks.')
//               for(var x=0; x<picks.length; x++){
//                 var pick = JSON.parse(picks[x])
//                 // console.log('pick #', x, pick)
//                 var pickResult = '';
//                 if(pick.pickType=='spread'){
//                   console.log('calculating spread')
//                   var pickTeam = pick.pickTeam
//                   var homeTeamIsPickTeam = false;
//
//                   var game = null;
//                   for(var q=0; q<games.length; q++){
//                     if(games[q].homeTeam.includes(pickTeam)){
//                       game = games[q];
//                       homeTeamIsPickTeam = true;
//                       break;
//                     }else if(games[q].awayTeam.includes(pickTeam)){
//                       game = games[q];
//                       break;
//                     }
//                   }
//                   if(game==null){
//                     console.log('SHIT SHIT SHIT, cannnot find:', pickTeam)
//                   }else{
//                     console.log('FOUND PICK MATCHUP BASED ON TEAM NAME')
//                     console.log()
//                     var pickNumber = Number(pick.pickNumber)
//
//                     console.log(pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumber)
//                     console.log(game.homeTeam, ' :',game.homeTeamScore)
//                     console.log(game.awayTeam, ' :',game.awayTeamScore)
//                     if(pickNumber < 0){
//                       if(homeTeamIsPickTeam){
//                         // HomeTeam -12
//                         var actualNumber = game.awayTeamScore - game.homeTeamScore
//                         console.log('actualNumber', actualNumber)
//                         if(actualNumber < pickNumber){
//                           pickResult = 'WINNER';
//                         }else if(actualNumber == pickNumber){
//                           pickResult = 'PUSH';
//                         }else{
//                           pickResult = 'LOSER';
//                         }
//                       }else{
//                         // AwayTeam -12
//                         var actualNumber = game.homeTeamScore - game.awayTeamScore
//                         console.log('actualNumber', actualNumber)
//                         if(actualNumber < pickNumber){
//                           pickResult = 'WINNER';
//                         }else if(actualNumber == pickNumber){
//                           pickResult = 'PUSH';
//                         }else{
//                           pickResult = 'LOSER';
//                         }
//                       }
//                     }else{
//                       if(homeTeamIsPickTeam){
//                         // HomeTeam +12
//                         var actualNumber = game.awayTeamScore - game.homeTeamScore
//                         console.log('actualNumber', actualNumber)
//                         if(actualNumber < pickNumber){
//                           pickResult = 'WINNER';
//                         }else if(actualNumber == pickNumber){
//                           pickResult = 'PUSH';
//                         }else{
//                           pickResult = 'LOSER';
//                         }
//                       }else{
//                         // AwayTeam +12
//                         var actualNumber = game.homeTeamScore - game.awayTeamScore
//                         console.log('actualNumber', actualNumber)
//                         if(actualNumber < pickNumber){
//                           pickResult = 'WINNER';
//                         }else if(actualNumber == pickNumber){
//                           pickResult = 'PUSH';
//                         }else{
//                           pickResult = 'LOSER';
//                         }
//                       }
//                     }
//                   }
//                 }else if (pick.pickType=='totals'){
//                   console.log('calculating totals')
//                   var homeTeamIsPickTeam = false;
//                   var pickTeam = pick.pickTeam
//
//                   var game = null;
//                   for(var q=0; q<games.length; q++){
//                     if(games[q].homeTeam.includes(pickTeam)){
//                       game = games[q];
//                       homeTeamIsPickTeam = true;
//                       break;
//                     }else if(games[q].awayTeam.includes(pickTeam)){
//                       game = games[q];
//                       break;
//                     }
//                   }
//                   if(game==null){
//                     console.log('SHIT SHIT SHIT, cannnot find:', pickTeam)
//                   }else{
//                     console.log('FOUND PICK MATCHUP BASED ON TEAM NAME')
//                     var pickNumberString = pick.pickNumber.replace('OVER','')
//                     pickNumberString = pickNumberString.replace('UNDER','').trim()
//                     var pickNumber = Number(pickNumberString)
//                     console.log(pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pick.pickNumber)
//                     console.log(game.homeTeam, ' :',game.homeTeamScore)
//                     console.log(game.awayTeam, ' :',game.awayTeamScore)
//                     var combinedScore = Number(game.homeTeamScore) + Number(game.awayTeamScore)
//                     console.log('combinedScore:', combinedScore)
//                     if(pick.pickNumber.includes('OVER')){
//                       if(combinedScore > pickNumber){
//                         pickResult = 'WINNER';
//                       }else if(combinedScore == pickNumber){
//                         pickResult = 'PUSH';
//                       }else{
//                         pickResult = 'LOSER';
//                       }
//                     }else{
//                       if(combinedScore < pickNumber){
//                         pickResult = 'WINNER';
//                       }else if(combinedScore == pickNumber){
//                         pickResult = 'PUSH';
//                       }else{
//                         pickResult = 'LOSER';
//                       }
//                     }
//                   }
//                 }else if (pick.pickType=='parlay'){
//                   console.log('calculating parlay')
//                 }else if (pick.pickType=='moneyLine'){
//                   console.log('calculating moneyLine')
//                   var homeTeamIsPickTeam = false;
//                   var pickTeam = pick.pickTeam
//
//                   var game = null;
//                   var halfName = pickTeam.substring(0, pickTeam.length / 2)
//                   for(var q=0; q<games.length; q++){
//                     if(games[q].homeTeam.includes(halfName)){
//                       game = games[q];
//                       homeTeamIsPickTeam = true;
//                       break;
//                     }else if(games[q].awayTeam.includes(halfName)){
//                       game = games[q];
//                       break;
//                     }
//                   }
//                   if(game==null){
//                     console.log('SHIT SHIT SHIT, cannnot find:', pickTeam)
//                   }else{
//                     if(typeof game.winner != 'undefined'){
//                       console.log('FOUND PICK MATCHUP BASED ON TEAM NAME')
//
//                       console.log(pick.userName,' wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' to pull the upset ')
//                       console.log('pt:', pickTeam)
//                       console.log('w:', game.winner)
//                       console.log(game.homeTeam, ' :',game.homeTeamScore)
//                       console.log(game.awayTeam, ' :',game.awayTeamScore)
//                       if(game.winner.includes(halfName)){
//                         pickResult = 'WINNER';
//                       }else{
//                         pickResult = 'LOSER';
//                       }
//                     }else{
//                       console.log('game is not finished')
//                     }
//                   }
//                 }else{
//                   console.log('what the hell is this pick', pick.pickType)
//                 }
//
//
//                 console.log('... pick result:',pickResult)
//
//               }
//             })
//           }
//         })
//
//         res.send('calculateResults DONE')
//       })
//     })
//
// });


app.all('/*', function(req, res, next) {
    var cookie = req.cookies.authenticatedUser;
    console.log('cookie:',cookie)
    res.sendFile(path.join(__dirname,"app/main.html"));
});

app.listen(process.env.PORT || 9090);
