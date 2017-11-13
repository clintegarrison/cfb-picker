'use strict'

const { Client } = require('pg')
const client = new Client()

client.connect()

function createUser(userName, password, email){
  executeQuery('INSERT INTO users VALUES($1,$2,$3)', [userName, password, email], function(){
    
  })
}

function createWager(userName, wagerAmount, pickType, callback){
    executeQuery('INSERT INTO wagers (user_name,wager_amount,pick_type,wager_status) VALUES($1,$2,$3,$4) RETURNING wager_id', [userName, wagerAmount,pickType,'TBD'], function(result){
      callback(result[0].wager_id)
    })
}

function doesGameExist(weekNumber,teamOne,teamTwo, callback){
    executeQuery('SELECT game_id FROM games WHERE week_number=$1 AND team_one=$2 AND team_two=$3', [weekNumber, teamOne, teamTwo], function(result){
      if (typeof result == 'undefined' || result.length == 0){
        callback(false)
      }else{
        callback(result[0].game_id)
      }
    })
}

function createGame(gameTime,weekNumber,teamOne,teamTwo, callback){
    executeQuery('INSERT INTO games (game_status,game_time,week_number,team_one,team_two,team_one_score,team_two_score) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING game_id', ['TBD', gameTime, weekNumber, teamOne, teamTwo, 0, 0], function(result){
      callback(result[0].game_id)
    })
}

function createPick(wagerId, pickType, pickTeam, pickNumber, pickNumberQualifier, weekNumber, gameId, callback){
    executeQuery('INSERT INTO picks (wager_id, pick_type, pick_team, pick_number, pick_number_qualifier, week_number, game_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING pick_id', [wagerId, pickType, pickTeam, pickNumber, pickNumberQualifier, weekNumber, gameId], function(result){
      callback(result[0].pick_id)
    })
}

function getUserPicks(userName, callback){
  executeQuery('SELECT user_name,pick_type,pick_type,wager_amount,pick_team,pick_number,pick_number_qualifer,week_number FROM pikcs WHERE user_name=$1', [userName], function(result){
    callback(results)
  })
}

function authenticateUser(userName, userPass, callback){
  executeQuery('SELECT user_name FROM users WHERE user_name=$1 AND user_pass=$2', [userName, userPass], function(result){
    if (typeof result == 'undefined' || result.length == 0){
      callback(false)
    }else{
      callback(true)
    }
  })
}

function getGamesThatAreNotFinalByWeek(weekNumber, callback){
  executeQuery('SELECT game_id,game_status,game_time,week_number,team_one,team_two,team_one_score,team_two_score FROM games WHERE game_status=$1 AND week_number=$2', ['TBD',weekNumber], function(result){
    if (typeof result == 'undefined' || result.length == 0){
      callback(false)
    }else{
      callback(result)
    }
  })
}

function updateGameScores(gameId, teamOneScore, teamTwoScore, gameStatus, callback){
  executeQuery('UPDATE games SET team_one_score=$2, team_two_score=$3, game_status=$4 WHERE game_id=$1', [gameId, teamOneScore, teamTwoScore, gameStatus], function(result){
    callback(result)
  })
}



function executeQuery(sql, args, callback){
    console.log('SQL=', sql)
    console.log('ARGS=', args)
    client.query(sql, args, function(err, res) {
      if (err) {
        console.log(err.stack)
      } else {
        callback(res.rows)
      }
    })

}

var databaseManager = {
	createUser: createUser,
  createWager: createWager,
  doesGameExist: doesGameExist,
  createGame: createGame,
  createPick: createPick,
  authenticateUser: authenticateUser,
  getGamesThatAreNotFinalByWeek: getGamesThatAreNotFinalByWeek,
  updateGameScores: updateGameScores

}

module.exports = databaseManager;
