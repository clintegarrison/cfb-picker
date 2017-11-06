'use strict'

var http = require('http')
var redisManager = require('./redisManager')



var getGamesFeed = function(weekNo){
  return new Promise(
  function(resolve, reject){
    var games = []
    var url = 'http://odds-service.herokuapp.com/getScores' + '?weekNo=' + weekNo
    console.log('url:',url)
    http.get(url, function(response) {
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
}

var getUserPicks = function(userPicksKey){
  return new Promise(function(resolve,reject){
    redisManager.getList(userPicksKey, function(userPicks){
      // console.log('userPicks',userPicks)
      var userPicsObj = {
        userName: userPicksKey.split(':')[1],
        picks: filterPicksByWeek(userPicks)
      }
      // console.log('getUserPics=', userPicsObj)
      resolve(userPicsObj)
    })
  })
}

var filterPicksByWeek = function(userPicks){
  var filteredPicks = []

  for(var i=0; i<userPicks.length; i++){
    try {
      var pick = JSON.parse(userPicks[i])
      if(pick.weekNumber==getCurrentWeek()){
        filteredPicks.push(pick)
      }
    } catch (e) {
      // console.log(userPicks[i])
    }
  }
  return filteredPicks
}

var getAllUserPicks = function(userPickKey){
  return new Promise(function(resolve, reject){
      redisManager.getList(userPickKey, function(userPicks){
        var parsedPicks = []
        for(var i=0; i<userPicks.length; i++){
          parsedPicks.push(JSON.parse(userPicks[i]))
        }
        resolve(parsedPicks)
      })
  })
}

var findGamesForParlay = function(pickJson, games){
  return new Promise(function(resolve, reject){
    console.log('parlay')
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
    // console.log('pick')
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
      }else if(games[q].teamTwo.includes(pickTeam) && games[q].teamTwoScore != ''){
        game = games[q];
        if(games[q].teamOne.includes(oppTeam)){
          break;
        }
      }else if(games[q].teamOne.includes(oppTeam) && games[q].teamTwoScore != ''){
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
      //found it
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
      console.log(pick, game)
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
  var pickResult = ''
  if(game.winner.toUpperCase() == pick.pickTeam.toUpperCase()){
    pickResult = 'WINNER';
  }else{
    pickResult = 'LOSER';
  }
    console.log('MONEYLINE: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pick.pickNumber, ' ', pickResult)
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
    console.log('TOTALS: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumberString, ' ',pickResult)

    return createResult(pick, game, pickResult)
}

var didSpreadWin = function(pick, game){
    var pickNumber = Number(pick.pickNumber)
    var pickResult = ''

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
    console.log('SPREAD: ',pick.userName,'wagered:', pick.pickAmount, ' ON:',pick.pickTeam, ' ',pickNumber, ' ', pickResult)
    // console.log('result:', pickResult)
    return createResult(pick, game, pickResult)
}

var getCurrentWeek = function(){
  var rightNow = new Date()
  var currentWeek = 0

  var weeks = [
    new Date("2017/9/5"),
    new Date("2017/9/12"),
    new Date("2017/9/19"),
    new Date("2017/9/24"),
    new Date("2017/10/1"),
    new Date("2017/10/8"),
    new Date("2017/10/15"),
    new Date("2017/10/22"),
    new Date("2017/10/29"),
    new Date("2017/11/5"),
    new Date("2017/11/12"),
    new Date("2017/11/19")
  ]

  for(var i=0; i<weeks.length; i++){
    if(weeks[i] > rightNow){
      currentWeek = i+1
      break;
    }
  }
  return 10
}

var calculateCreditChange = function(result){
  if(result.betResult=='LOSER'){
    return -result.wagerAmount
  }
  else if(result.betResult=='PUSH'){
    return 0
  }
  else if(result.pickType=='spread' || result.pickType=='totals'){
    if(result.wagerAmount==440){
      return 400
    }else if(result.wagerAmount==330){
      return 300
    }else if(result.wagerAmount==220){
      return 200
    }else if(result.wagerAmount==110){
      return 100
    }
  }else if(result.pickType=='moneyLine'){
    var div = result.pickNumber / 100
    return result.wagerAmount * div
  }else if(result.pickType=='parlay'){
    if(result.wagerAmount==50){
      if(result.parlayGamCount==1){
        return 100
      }else if(result.parlayGamCount==2){
        return 130
      }else if(result.parlayGamCount==3){
        return 300
      }else if(result.parlayGamCount==4){
        return 500
      }
    }else if(result.wagerAmount==100){
      if(result.parlayGamCount==1){
        return 200
      }else if(result.parlayGamCount==2){
        return 260
      }else if(result.parlayGamCount==3){
        return 600
      }else if(result.parlayGamCount==4){
        return 1000
      }
    }
  }
}

var prettyPrintPick = function(result){
  if(result.pickType=='spread'){
    return prettyPrintSpreakPick(result)
  }else if(result.pickType=='totals'){
    return prettyPrintTotalPick(result)
  }else if(result.pickType=='moneyLine'){
    return prettyPrintMoneyLinePick(result)
  }else{
    return null
  }
}

var prettyPrintSpreakPick = function(result){
  return '  ' + result.pickTeam + '(' + result.pickTeamScore + ') to cover ' + result.pickNumber + ' \nvs ' + result.opponentTeam + '(' + result.opponentTeamScore + ')'
}

var prettyPrintTotalPick = function(result){
  return '  ' + result.pickTeam + '(' + result.pickTeamScore + ') ' + result.pickNumber + '\nvs ' +result.opponentTeam + '(' + result.opponentTeamScore + ')'
}

var prettyPrintMoneyLinePick = function(result){
  return '  ' + result.pickTeam + '(' + result.pickTeamScore + ') ' + result.pickNumber + ' odds \nvs ' + result.opponentTeam + '(' + result.opponentTeamScore + ')'
}

var getFinalResultsPicks = function(weekResultsKeys){
  return new Promise(function(resolve, reject){
    redisManager.getList(weekResultsKeys, function(userPicks){
      var parsedUserPicks = []
      for(var i=0; i<userPicks.length; i++){
        parsedUserPicks.push(JSON.parse(userPicks[i]))
      }
      resolve(parsedUserPicks)
    })
  })
}

var calc = {
	getGamesFeed: getGamesFeed,
  getAllUserPicks: getAllUserPicks,
  getUserPicks: getUserPicks,
  findGameForPick: findGameForPick,
  didSingleGameBetWin: didSingleGameBetWin,
  findGamesForParlay: findGamesForParlay,
  didParlayBetWin: didParlayBetWin,
  getCurrentWeek: getCurrentWeek,
  calculateCreditChange: calculateCreditChange,
  prettyPrintPick: prettyPrintPick,
  getFinalResultsPicks: getFinalResultsPicks
}

module.exports = calc;
