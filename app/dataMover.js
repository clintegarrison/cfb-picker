'use strict'

var redisManager = require('./redisManager')
var dbManager = require('./databaseManager')
var utils = require('./utils')
var calc = require('./calc')

function startMovePicks(){
  redisManager.getUserPicksKeys(function(userPickKeys){
      var getUserPicksPromises = []
      for(var i=0; i<userPickKeys.length; i++){
        getUserPicksPromises.push(calc.getAllUserPicks(userPickKeys[i]))
      }
      Promise.all(getUserPicksPromises).then(function(userPicksArray){
        console.log('here')
        var movePicksPromises = []
        for(var x=0; x<userPicksArray.length; x++){
          console.log(userPickKeys[x],' ', userPicksArray[x].length)
          movePicksPromises.push(movePicks(userPickKeys[x], userPicksArray[x]))
        }
        Promise.all(movePicksPromises).then(function(doneMessage){
          console.log('ALL DONE')
        })
      })
    })
}
function movePicks(key, picks){
  return new Promise(function(resolve, reject){
    var createWagerArray = []
    console.log('picks length:', picks.length)
    for(var i=0; i<picks.length; i++){
      createWagerArray.push(createWager(picks[i]))
    }
    Promise.all(createWagerArray).then(function(wagerId){
      console.log('wager id:', wagerId)
      var movePicks = []
      for(var i=0; i<picks.length; i++){
        var pick = picks[i]
        console.log('pick.pickType............',pick.pickType)
        if(pick.pickType=='parlay'){
          for(var x=0; x<pick.parlays.length; x++){
            pick.parlays[x].weekNumber = pick.weekNumber
            movePicks.push(createGameAndPick(pick.parlays[x], wagerId[i]))
          }
        }else{
          movePicks.push(createGameAndPick(pick, wagerId[i]))
        }
      }
      Promise.all(movePicks).then(function(){
        var doneMsg = 'DONE with: ' + key
        console.log(doneMsg)
        resolve(doneMsg)
      })
    })
  })
}

function createWager(p){
  return new Promise(function(resolve, reject){
    dbManager.createWager(p.userName, p.pickAmount, p.pickType, function(wagerId){
      resolve(wagerId)
    })
  })
}

function createGameAndPick(p, wagerId){
  return new Promise(function(resolve,reject){
    // 2 - Chek if the game exists
    dbManager.doesGameExist(p.weekNumber,p.pickTeam,p.opponentTeam, function(falseOrGameId){
      console.log('doesGameExist... falseOrGameId:', falseOrGameId)
      var pickNumber = p.pickNumber
      var pickNumberQualifier = null
      var pickNumberArray = pickNumber.split(" ")
      if(pickNumberArray.length > 1){
        pickNumberQualifier = pickNumberArray[0]
        pickNumber = Number(pickNumberArray[1])
      }else{
        pickNumber = Number(pickNumber)
      }
      var gameId = 0
      if(!falseOrGameId){
        // 3a - Game doesn't exist, create it
        dbManager.createGame(utils.gameTimeToDate(p.gameTime), p.weekNumber,p.pickTeam,p.opponentTeam, function(returnedGameId){
          gameId = returnedGameId
          console.log('createGame... gameId:', gameId)
          dbManager.createPick(wagerId,p.pickType,p.pickTeam,pickNumber, pickNumberQualifier, p.weekNumber,gameId, function(result){
            console.log('createPick......', result)
            resolve()
          })
        })
      }else{
        // 3b - Game exists, grab the gameId
        gameId = falseOrGameId
        console.log('game exists... gameId:', gameId)
        dbManager.createPick(wagerId,p.pickType,p.pickTeam,pickNumber, pickNumberQualifier, p.weekNumber,gameId, function(result){
          console.log('createPick......', result)
          resolve()
        })
      }
    })
  })
}

function updateGameScores(weekNumber){

  calc.getGamesFeed(weekNumber).then(function(gameFeed){
    console.log('gameFeedLength:', gameFeed.length)
    dbManager.getGamesThatAreNotFinalByWeek(weekNumber, function(notFinalGames){
      for(var i=0; i<notFinalGames.length; i++){
        var nfg = notFinalGames[i]
        console.log(nfg)
        for(var x=0; x<gameFeed.length; x++){
          var gf = gameFeed[x]
          var gameStatus = 'TBD'
          // GAME STATUE IS NULL?!
          if(gf.gameState=='Final Score'){
            gameStatus = 'FINAL'
          }else{
            // console.log('!!!!!STATE!!!!', gameFeed[x])
          }
          if(gf.teamOne.toUpperCase() === nfg.team_one.toUpperCase()){
            dbManager.updateGameScores(nfg.game_id, Number(gf.teamOneScore), Number(gf.teamTwoScore), gameStatus, function(result){
              // break;
            })
          }else if(gf.teamOne.toUpperCase() === nfg.team_two.toUpperCase()){
            dbManager.updateGameScores(nfg.game_id, Number(gf.teamTwoScore), Number(gf.teamOneScore), gameStatus, function(result){
              // break;
            })
          }
        }
      }
    })
  })
}

function moveUsers(){
  redisManager.getUserKeys(function(results){
    var filteredResults = []
    for(var i=0; i<results.length; i++){
      var result = results[i]
      if(result.split(':').length < 3 && result.indexOf('credit') === -1){
        filteredResults.push(result)
      }
    }
    console.log('filteredResults:',filteredResults)
    for(var i=0; i<filteredResults.length; i++){
      redisManager.getValueByKey(filteredResults[i], function(userInfo){
        var u = JSON.parse(userInfo)
        console.log(u)
        dbManager.createUser(u.userName, u.password, u.email)
      })
    }
  })
}

var dataMover = {
	movePicks: movePicks,
  moveUsers: moveUsers,
  updateGameScores: updateGameScores,
  startMovePicks: startMovePicks
}

module.exports = dataMover;
