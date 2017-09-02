'use strict'

 function convertToDate(gameTime){

    if(gameTime!=null){
      var gameStart = new Date()
      gameStart.setMonth(gameTime.substring(0,2) - 1, gameTime.substring(3,5))
      var hours = 0;
      if(gameTime.slice(-2) == 'PM'){
        if(parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))!=12){
          hours = 12 + parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))
        }
      }else{
        hours = gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':'))
      }
      gameStart.setHours(hours)
      var minsSubStr = gameTime.substring(gameTime.indexOf(':'), gameTime.length)
      gameStart.setMinutes(minsSubStr.substring(1, minsSubStr.indexOf(' ')))

      return gameStart
    }else{
      return null
    }
}

function hasGameStarted(pick){
  var pickAlreadyStarted = null
  var earliestGameTime = null
  if(pick.pickType=='parlay'){
    earliestGameTime = convertToDate(pick.parlays[0].gameTime)
    pickAlreadyStarted = pick.parlays[0]
    for(var i=1; i<pick.parlays.length; i++){
      var parlayGameTime = convertToDate(pick.parlays[i].gameTime)
      if(earliestGameTime > parlayGameTime){
        earliestGameTime = parlayGameTime
        pickAlreadyStarted = pick.parlays[i]
      }
    }
  }else{
    earliestGameTime = convertToDate(pick.gameTime)
    pickAlreadyStarted = pick
  }

  var serverTime = new Date()
  console.log('serverTime: ', serverTime)
  console.log('earliestGameTime: ', earliestGameTime)

  if(earliestGameTime < serverTime){
    return pickAlreadyStarted.pickTeam + ' GAME HAS ALREADY STARTED'
  }else{
    return 'NO'
  }
}

var pickUtils = {
	hasGameStarted: hasGameStarted
}

module.exports = pickUtils;
