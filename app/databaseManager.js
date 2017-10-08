'use strict'

const { Client } = require('pg')
const client = new Client()

client.connect()

function createUser(userName, password, email){
  executeQuery('INSERT INTO users VALUES($1,$2,$3)', [userName, password, email])
  .then(
    executeQuery('INSERT INTO credits VALUES($1,$2)', [userName, 2500])
  )
}

function createWager(userName, wagerAmount){
  return new Promise(
    function(resolve, reject){
      executeQuery('INSERT INTO wagers (user_name,wager_amount,wager_status) VALUES($1,$2,$3) RETURNING wager_id', [userName, wagerAmount,'TBD'])
      .then(function(result){
        console.log('createWager result:', result)
        resolve(result[0].wager_id)
      })
    }
  )
}

function doesGameExist(gameTime,teamOne,teamTwo){
  return new Promise(
    function(resolve, reject){
      executeQuery('SELECT game_status FROM games WHERE game_time=$1 AND team_one=$2 AND team_two=$3', [gameTime, teamOne, teamTwo])
      .then(function(result){
        console.log('doesGameExist result:', result)
        resolve(result.length > 0 ? true : false)
      })
    }
  )
}

function createGame(gameTime,teamOne,teamTwo){
  return new Promise(
    function(resolve, reject){
      executeQuery('INSERT INTO games (game_status,game_time,team_one,team_two,team_one_score,team_two_score) VALUES($1,$2,$3,$4,$5,$6) RETURNING game_id', ['TBD', gameTime, teamOne, teamTwo, 0, 0])
      .then(function(result){
        console.log('createGame result:', result)
        resolve(result[0].wager_id)
      })
    }
  )
}


function executeQuery(sql, args){
  return new Promise(
    function(resolve, reject){

      client.query(sql, args)
      .then(res => {
        var results = []
        for(var i=0; i<res.rows.length; i++){
          results.push(res.rows[i])
        }
        console.log('results:',results)
        resolve(results)
      })
      .catch(e => {
        console.error(e.stack)
      })
    }
  )
}

var databaseManager = {
	createUser: createUser,
  createWager: createWager,
  doesGameExist: doesGameExist,
  createGame: createGame

}

module.exports = databaseManager;
