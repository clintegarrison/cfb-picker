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
        for(var x=0; x<gameFeed.length; x++){
          var gf = gameFeed[x]
          var gameStatus = 'TBD'


          if(gf.status=='Final Score'){
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

function gradePicks(){
  dbManager.getUngradedWagers(function(results){
    var formattedWagers = []

    for(var i=0; i<results.length; i++){
      var result = results[i]
      if(result.wager_type=='parlay'){
        formattedWagers.push(formatParlayWager(result, results))
      }else{
        formattedWagers.push(formatSingleGameWager(result))
      }
    }

    formattedWagers = Array.from( new Set(formattedWagers) );

    console.log('!!!!!!!!!!!!  ', formattedWagers.length)

    for(var i=0; i<formattedWagers.length; i++){
      var result = gradePick(formattedWagers[i])
    }

  })
}

function gradePick(wager){
  var result = '' // WINNER, LOSER, PUSH
  if(wager.wagerType=="spread"){
    result = didSpreadWin(wager)
  }else if(wager.wagerType=="moneyLine"){
    result = didMoneyLineWin(wager)
  }else if(wager.wagerType=="totals"){
    result = didTotalsWin(wager)
  }else if(wager.wagerType=="parlay"){
    var results = []
    for(var i=0; i<wager.picksAndGames.length; i++){
      if(wager.wagerType=="spread"){
        result = didSpreadWin(wager)
      }else if(wager.wagerType=="moneyLine"){
        result = didMoneyLineWin(wager)
      }else if(wager.wagerType=="totals"){
        result = didTotalsWin(wager)
      }
      results.push(result)
    }

    result = "WINNER"
    for(var r=0; r<results.length; r++){
      if(results[r]!="WINNER" || results[r]!="PUSH"){
        result = "LOSER"
      }
    }
  }
  return result
}

function didSpreadWin(wager){

}

function didMoneyLineWin(wager){

}

function didTotalsWin(wager){

}



function formatParlayWager(pick, picks){
  var formattedWager = {
    wagerId : pick.wager_id,
    wagerType : pick.wager_type,
    wagerAmount : pick.wager_amount,
    picksAndGames : []
  }

  var wagerId = pick.wager_id

  for(var i=0; i<picks.length; i++){
    var tempPick = picks[i]
    if(tempPick.wager_id == wagerId){
      var pickAndGame = {
        pick : {
          pickTeam : tempPick.pick_team,
          pickType : tempPick.pick_type,
          pickNumber : tempPick.pick_number,
          pickNumberQualifier : tempPick.pick_number_qualifier
        },
        game : {
          teamOne : tempPick.team_one,
          teamTwo : tempPick.team_two,
          teamOneScore : tempPick.team_one_score,
          teamTwoScore: tempPick.team_two_score
        }
      }
      formattedWager.picksAndGames.push(pickAndGame)
    }
  }
}

function formatSingleGameWager(pick){
  var formattedWager = {
    wagerId : pick.wager_id,
    wagerType : pick.wager_type,
    wagerAmount : pick.wager_amount,
    picksAndGames : [
      {
        pick : {
          pickTeam : pick.pick_team,
          pickType : pick.pick_type,
          pickNumber : pick.pick_number,
          pickNumberQualifier : pick.pick_number_qualifier
        },
        game : {
          teamOne : pick.team_one,
          teamTwo : pick.team_two,
          teamOneScore : pick.team_one_score,
          teamTwoScore: pick.team_two_score
        }
      }
    ]
  }
  return formattedWager
}

var dataMover = {
	movePicks: movePicks,
  moveUsers: moveUsers,
  updateGameScores: updateGameScores,
  startMovePicks: startMovePicks,
  gradePicks: gradePicks
}

module.exports = dataMover;
