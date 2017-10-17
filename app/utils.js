'use strict'

function gameTimeToDate(gameTime){
  if(gameTime!=null){
    var gameStart = new Date()
    gameStart.setMonth(gameTime.substring(0,2) - 1, gameTime.substring(3,5))
    var hours = 0;
    if(gameTime.slice(-2) == 'PM'){
      console.log('hour: ', parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':'))))
      if(parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))!=12){
        hours = 12 + parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))
      }else{
        hours = 12
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

function getCurrentWeek(){
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
    new Date("2017/10/28"),
    new Date("2017/11/4"),
    new Date("2017/11/11"),
    new Date("2017/11/18")
  ]

  for(var i=0; i<weeks.length; i++){
    if(weeks[i] > rightNow){
      currentWeek = i+1
      break;
    }
  }
  return currentWeek
}

var utils = {
	gameTimeToDate: gameTimeToDate,
  getCurrentWeek: getCurrentWeek

}

module.exports = utils;
