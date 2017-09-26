'use strict'

const { Client } = require('pg')
const client = new Client()

function query(query){
  return new Promise(
    function(resolve, reject){
      client.connect()

      client.query(query)
      .then(res => {
        var results = []
        for(var i=0; i<res.rows.length; i++){
          results.push(res.rows[i])
        }
        console.log(results)
        resolve(results)
      })
      .catch(e => console.error(e.stack))
    }
  )
}

var databaseManager = {
	query: query
}

module.exports = databaseManager;
