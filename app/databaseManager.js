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
  createWager: createWager
}

module.exports = databaseManager;
