'use strict'

var redisManager = require('./redisManager')
var dbManager = require('./databaseManager')

function movePicks(){
  redisManager.getList('user:ClintG:picks', function(picks){
    for(var i=0; i<picks.length; i++){
      var jsonPick = JSON.parse(picks[i])
      console.log(jsonPick)
    }
    dbManager.createWager('clint', 200).then(function(id){
        console.log('rez:', id)
      }
    )
  })
}

var dataMover = {
	movePicks: movePicks
}

module.exports = dataMover;
