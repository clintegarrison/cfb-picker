'use strict'

var http = require('http')
var redisManager = require('./redisManager')

var getGamesFeed = new Promise(
  function(resolve, reject){
    var games = []

    http.get('http://odds-service.herokuapp.com/getScores', function(response) {
      // Buffer the body entirely for processing as a whole.
      var bodyChunks = [];
      response.on('data', function(chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
      }).on('end', function() {
        var body = Buffer.concat(bodyChunks);

        // console.log('body',JSON.parse(body))
        var gamesData = JSON.parse(body)
        // var gamesData = jsonData.games

        for(var z=0; z<gamesData.length; z++){
          var game = {}
          game.teamOne = gamesData[z].teamOne
          game.teamTwo = gamesData[z].teamTwo

          game.teamOneScore = gamesData[z].teamOneScore
          game.teamTwoScore = gamesData[z].teamTwoScore

          game.status = gamesData[z].gameState

          game.winner = gamesData[z].winner
          games[z] = game
        }

        resolve(games)
      })
    })
})

var getUserPicks = function(userPicksKey){
  return new Promise(function(resolve,reject){
    redisManager.getList(userPicksKey, function(userPicks){
      var userPicsObj = {
        userName: userPicksKey.split(':')[1],
        picks: userPicks
      }
      resolve(userPicsObj)
    })
  })
}

var getAllUserPicks = function(userPickKeys){
  return new Promise(function(resolve, reject){
    var usersPicksArray = []
    for(var i=0; i<userPickKeys.length; i++){
      redisManager.getList(userPickKeys[i], function(userPicks){
        var userPicks = {
          // userName: userPickKeys[i].split(':')[1],
          picks: userPicks
        }
        console.log('looping')
        usersPicksArray.push(userPicks)
      })
    }
    console.log('resolving')
    resolve(usersPicksArray)
  })
}

var findGameForPick = function(pickString, games){
  return new Promise(function(resolve, reject){
    // console.log('findGameForPick...')
    var pick = JSON.parse(pickString)

    var pickTeam = pick.pickTeam
    var oppTeam = pick.opponentTeam

    if (typeof pickTeam != 'undefined'){
      pickTeam = pickTeam.toUpperCase()
    }
    if (typeof oppTeam != 'undefined'){
      oppTeam = oppTeam.toUpperCase()
    }
    // console.log('pickTeam:',pickTeam)
    // console.log('oppTeam',oppTeam)

    var game = null;
    for(var q=0; q<games.length; q++){
      if(games[q].teamOne.includes(pickTeam)){
        game = games[q];
        break;
      }else if(games[q].teamTwo.includes(pickTeam)){
        game = games[q];
        break;
      }else if(games[q].teamOne.includes(oppTeam)){
        game = games[q];
        break;
      }else if(games[q].teamTwo.includes(oppTeam)){
        game = games[q];
        break;
      }
    }
    if(game==null){
      console.log('SHIT SHIT SHIT, cannnot find: ', pick.pickType, ' ',pickTeam, ' ', pick.gameTime)
    }else{
      console.log('found it!')
    }
    var resolved = {
      pick: pick,
      game: game
    }
    resolve(resolved)
  })
}

var didBetWin = function(pick, game){
  // console.log('didBetWin - game:',game)
  // console.log('didBetWin - pick:',pick)

  if(game != null && game.status == 'Final Score'){
    if(pick.pickType == 'spread'){
      didSpreadWin(pick, game)
    }
  }else{
    console.log('Not grading game, as it is not over:', pick.gameTime )
  }
}

var didSpreadWin = function(pick, game){
    console.log('calculating spread')

    var pickNumber = Number(pick.pickNumber)
    var pickResult = ''

    console.log(pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumber)
    // console.log(game.teamOne, ' :',game.teamOneScore)
    // console.log(game.teamTwo, ' :',game.teamTwoScore)
    console.log('game:', game)
    if(pickNumber < 0){
      if(pick.pickTeam.toUpperCase() == game.teamOne){
        // teamOne -12
        var actualNumber = game.teamTwoScore - game.teamOneScore
        console.log('actualNumber', actualNumber)
        if(actualNumber < pickNumber){
          pickResult = 'WINNER';
        }else if(actualNumber == pickNumber){
          pickResult = 'PUSH';
        }else{
          pickResult = 'LOSER';
        }
      }else{
        // teamTwo -12
        var actualNumber = game.teamOneScore - game.teamTwoScore
        console.log('actualNumber', actualNumber)
        if(actualNumber < pickNumber){
          pickResult = 'WINNER';
        }else if(actualNumber == pickNumber){
          pickResult = 'PUSH';
        }else{
          pickResult = 'LOSER';
        }
      }
    }else{
      if(pick.pickTeam.toUpperCase() == game.teamOne){
        // teamOne +12
        var actualNumber = game.teamTwoScore - game.teamOneScore
        console.log('actualNumber', actualNumber)
        if(actualNumber < pickNumber){
          pickResult = 'WINNER';
        }else if(actualNumber == pickNumber){
          pickResult = 'PUSH';
        }else{
          pickResult = 'LOSER';
        }
      }else{
        // teamTwo +12
        var actualNumber = game.teamOneScore - game.teamTwoScore
        console.log('actualNumber', actualNumber)
        if(actualNumber < pickNumber){
          pickResult = 'WINNER';
        }else if(actualNumber == pickNumber){
          pickResult = 'PUSH';
        }else{
          pickResult = 'LOSER';
        }
      }
    }
    console.log('result:', pickResult)
}

var calc = {
	getGamesFeed: getGamesFeed,
  getAllUserPicks: getAllUserPicks,
  getUserPicks: getUserPicks,
  findGameForPick: findGameForPick,
  didBetWin: didBetWin
}

module.exports = calc;
