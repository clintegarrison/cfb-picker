'use strict'

var redisManager = require('./redisManager')
var dbManager = require('./databaseManager')

function movePicks(){
  redisManager.getList('user:ClintG:picks', function(picks){
    for(var i=0; i<picks.length; i++){
      var jsonPick = JSON.parse(picks[i])
      console.log(jsonPick)
    }
    dbManager.createWager('clint', 200).then(function(wagerId){
        console.log('wagerId:', wagerId)

        // does game exist?
        dbManager.doesGameExist(null,'teamOne','teamTwo').then(function(gameExists){
          if(!gameExists){
            dbManager.createGame(null,'bama','auburn')
          }
        })

        // if not.. create game
      }
    ).then(function(){console.log('DDDDDDDDDDDDDD:')})
  })
}

var dataMover = {
	movePicks: movePicks
}

module.exports = dataMover;
