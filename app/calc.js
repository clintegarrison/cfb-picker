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
        picks: filterPicksByWeek(userPicks)
      }
      resolve(userPicsObj)
    })
  })
}

var filterPicksByWeek = function(userPicks){
  var filteredPicks = []
  // console.log(userPicks.length)

  for(var i=0; i<userPicks.length; i++){
    try {
      var pick = JSON.parse(userPicks[i])
      if(pick.weekNumber==1){
        filteredPicks.push(pick)
      }
    } catch (e) {
      console.log(userPicks[i])
    }
  }
  return filteredPicks
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

        usersPicksArray.push(userPicks)
      })
    }
    resolve(usersPicksArray)
  })
}

var findGamesForParlay = function(pickJson, games){
  return new Promise(function(resolve, reject){

    var pickArray = pickJson.parlays
    var parlayGameResults = []


    for(var i=0; i<pickArray.length; i++){
      var pick = pickArray[i]
      // console.log('finding parlay game for ', pick.pickTeam)
      var pickTeam = pick.pickTeam
      var oppTeam = pick.opponentTeam

      if (typeof pickTeam != 'undefined'){
        pickTeam = pickTeam.toUpperCase()
      }
      if (typeof oppTeam != 'undefined'){
        oppTeam = oppTeam.toUpperCase()
      }

      var game = null;
      for(var q=0; q<games.length; q++){
        if(games[q].teamOne.includes(pickTeam)){
          game = games[q];
          if(games[q].teamTwo.includes(oppTeam)){
            break;
          }
        }else if(games[q].teamTwo.includes(pickTeam)){
          game = games[q];
          if(games[q].teamOne.includes(oppTeam)){
            break;
          }
        }else if(games[q].teamOne.includes(oppTeam)){
          game = games[q];
          if(games[q].teamTwo.includes(pickTeam)){
            break;
          }
        }else if(games[q].teamTwo.includes(oppTeam)){
          game = games[q];
          if(games[q].teamOne.includes(pickTeam)){
            break;
          }
        }
      }
      if(game==null){
        console.log('SHIT SHIT SHIT, cannnot find: ', pick.pickType, ' ',pickTeam, ' ', pick.gameTime)
      }else{
        // console.log('found it!')
      }
      var resolved = {
        pick: pickJson,
        game: game
      }
      parlayGameResults.push(resolved)
    }
    resolve(parlayGameResults)
  })
}

var findGameForPick = function(pick, games){
  return new Promise(function(resolve, reject){

    var pickTeam = pick.pickTeam
    var oppTeam = pick.opponentTeam

    if (typeof pickTeam != 'undefined'){
      pickTeam = pickTeam.toUpperCase()
    }
    if (typeof oppTeam != 'undefined'){
      oppTeam = oppTeam.toUpperCase()
    }

    var game = null;
    for(var q=0; q<games.length; q++){
      if(games[q].teamOne.includes(pickTeam)){
        game = games[q];
        if(games[q].teamTwo.includes(oppTeam)){
          break;
        }
      }else if(games[q].teamTwo.includes(pickTeam)){
        game = games[q];
        if(games[q].teamOne.includes(oppTeam)){
          break;
        }
      }else if(games[q].teamOne.includes(oppTeam)){
        game = games[q];
        if(games[q].teamTwo.includes(pickTeam)){
          break;
        }
      }else if(games[q].teamTwo.includes(oppTeam)){
        game = games[q];
        if(games[q].teamOne.includes(pickTeam)){
          break;
        }
      }
    }
    if(game==null){
      console.log('SHIT SHIT SHIT, cannnot find: ', pick.pickType, ' ',pickTeam, ' ', pick.gameTime)
    }else{
      // console.log('found it!')
    }
    var resolved = {
      pick: pick,
      game: game
    }
    resolve(resolved)
  })
}

var didSingleGameBetWin = function(pick, game){
  return new Promise(function(resolve, reject){
    var pickResult = null;
    if(game != null && game.status == 'Final Score'){
      if(pick.pickType == 'spread'){
        pickResult = didSpreadWin(pick, game)
      }else if(pick.pickType == 'totals'){
        pickResult = didTotalsWin(pick, game)
      }else if(pick.pickType == 'moneyLine'){
        pickResult = didMoneyLineWin(pick, game)
      }
      console.log('-------------------------------')
    }else{
      console.log('Not grading game, as it is not over:', pick.gameTime )
    }
    resolve(pickResult)
  })
}

var didParlayBetWin = function(parlayGameResults){
  var parlayResult = 'WINNER'

  return new Promise(function(resolve, reject){
     console.log('------PARLAY START-------')
    //  console.log(parlayGameResults)
    var parlayGamCount = parlayGameResults.length
    var wagerAmount = parlayGameResults[0].pick.pickAmount
    var parlayResultsArray = []

    for(var i=0; i<parlayGameResults.length; i++){
      // var pick = parlayGameResults.parlays[i]
      var pick = parlayGameResults[i].pick.parlays[i]
      var game = parlayGameResults[i].game

      // console.log('game:',game)
      // console.log('pick:',pick)
      if(game != null && game.status == 'Final Score'){
        var gameResult = ''
        if(pick.pickType == 'spread'){
          gameResult = didSpreadWin(pick, game)
        }else if(pick.pickType == 'totals'){
          gameResult = didTotalsWin(pick, game)
        }else if(pick.pickType == 'moneyLine'){
          gameResult = didMoneyLineWin(pick, game)
        }
        console.log('GAME ', i + 1, '/', parlayGameResults.length, ' result:', gameResult.betResult)
        if(gameResult.betResult=='LOSER'){
          parlayResult = 'LOSER'
        } else if (gameResult.betResult=='PUSH') {
          parlayGamCount = parlayGamCount - 1
        }
        // console.log('8888888888888888888888')
        // console.log(gameResult)
        parlayResultsArray.push(gameResult)

      }else{
        parlayResult = 'TBD'
        console.log('Not grading game, as it is not over:', pick.gameTime )
      }
    }
    console.log('OVERALL PARLAY RESULT:', parlayResult)
    console.log('------PARLAY END-------')
    resolve(createParlayResult(parlayResultsArray, parlayResult,parlayGamCount,wagerAmount))
  })

  console.log('------PARLAY END-------')
}

var didMoneyLineWin = function(pick, game){
  console.log('MONEYLINE: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pick.pickNumber)
  var pickResult = ''
  if(game.winner.toUpperCase() == pick.pickTeam.toUpperCase()){
    pickResult = 'WINNER';
  }else{
    pickResult = 'LOSER';
  }
  return createResult(pick, game, pickResult)
  // console.log(pickResult)
}

var createResult = function(pick, game, result){
  var pickTeamScore = 0
  var opponentTeamScore = 0
  if(pick.pickTeam.toUpperCase() == game.teamOne){
    pickTeamScore = game.teamOneScore
    opponentTeamScore = game.teamTwoScore
  }else{
    pickTeamScore = game.teamTwoScore
    opponentTeamScore = game.teamOneScore
  }
  // single
  var finalResult = {
    betResult: result,
    userName: pick.userName,
    wagerAmount: pick.pickAmount,
    gameStatus: game.status,
    pickType: pick.pickType,
    pickNumber: pick.pickNumber,
    pickTeam: pick.pickTeam,
    pickTeamScore: pickTeamScore,
    opponentTeam: pick.opponentTeam,
    opponentTeamScore: opponentTeamScore
  }
  return finalResult
}
var createParlayResult = function(parlayResult, result, parlayGamCount, wagerAmount){

  var games = ''
  // console.log(parlayResult)
  // for(var i=0; i<parlayResult.length; i++){
  //   games += parlayResult[i].pick.pickTeam +  ' ' + parlayResult[i].pick.pickType + ' ' + parlayResult[i].pick.pickNumber
  // }
  // console.log('$$$$$$$$$$$$$$$$$$$$$$$$')
  // console.log(parlayResult)

  // parlay
  var finalResult = {
    betResult: result,
    userName: parlayResult[0].userName,
    wagerAmount: wagerAmount,
    parlayGamCount: parlayGamCount,
    pickType: 'parlay',
    games: parlayResult
  }
  return finalResult
}

var didTotalsWin = function(pick, game){
    var pickResult = ''
    var pickNumberString = pick.pickNumber.replace('OVER','')
    pickNumberString = pickNumberString.replace('UNDER','').trim()
    var pickNumber = Number(pickNumberString)

    console.log('TOTALS: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumberString)

    var combinedScore = Number(game.teamOneScore) + Number(game.teamTwoScore)
    // console.log('combinedScore:', combinedScore)
    // console.log('pickNumber:', pickNumber)
    // console.log(game)
    if(pick.pickNumber.includes('OVER')){
      if(combinedScore > pickNumber){
        pickResult = 'WINNER';
      }else if(combinedScore == pickNumber){
        pickResult = 'PUSH';
      }else{
        pickResult = 'LOSER';
      }
    }else{
      if(combinedScore < pickNumber){
        pickResult = 'WINNER';
      }else if(combinedScore == pickNumber){
        pickResult = 'PUSH';
      }else{
        pickResult = 'LOSER';
      }
    }

    return createResult(pick, game, pickResult)
}

var didSpreadWin = function(pick, game){
    var pickNumber = Number(pick.pickNumber)
    var pickResult = ''

    console.log('SPREAD: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumber)

    if(pickNumber < 0){
      if(pick.pickTeam.toUpperCase() == game.teamOne){
        // teamOne -12
        var actualNumber = game.teamTwoScore - game.teamOneScore
        // console.log('actualNumber', actualNumber)
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
        // console.log('actualNumber', actualNumber)
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
        // console.log('actualNumber', actualNumber)
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
        // console.log('actualNumber', actualNumber)
        if(actualNumber < pickNumber){
          pickResult = 'WINNER';
        }else if(actualNumber == pickNumber){
          pickResult = 'PUSH';
        }else{
          pickResult = 'LOSER';
        }
      }
    }
    // console.log('result:', pickResult)
    return createResult(pick, game, pickResult)
}

var calc = {
	getGamesFeed: getGamesFeed,
  getAllUserPicks: getAllUserPicks,
  getUserPicks: getUserPicks,
  findGameForPick: findGameForPick,
  didSingleGameBetWin: didSingleGameBetWin,
  findGamesForParlay: findGamesForParlay,
  didParlayBetWin: didParlayBetWin
}

module.exports = calc;
