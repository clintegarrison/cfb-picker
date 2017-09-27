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

function executeQuery(sql, args){
  return new Promise(
    function(resolve, reject){

      client.query(sql, args)
      .then(res => {
        var results = []
        for(var i=0; i<res.rows.length; i++){
          results.push(res.rows[i])
        }
        resolve(results)
      })
      .catch(e => {
        console.error(e.stack)
      })
    }
  )
}

var databaseManager = {
	createUser: createUser
}

module.exports = databaseManager;
