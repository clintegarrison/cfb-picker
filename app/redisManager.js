var redis = require('redis')
console.log(process.env.REDIS_URL)

var client = redis.createClient(process.env.REDIS_URL);

function setKeyValue(key, value){
  client.set(key, value, redis.print);
}

function getValueByKey(key, callback){
  client.get(key, function (err, reply) {
    if(err){
      callback(null, err)
    }else{
      console.log(reply)
      if(reply!==null){
        callback(reply.toString(), null)
      }else{
        callback(null, "not found")
      }
    }
  });
}

function addToList(key, value){
  client.lpush(key, value);
}

function removeFromList(key, value){
  client.lrem(key, 0, value);
}

function getList(key, callback){
  client.lrange(key, 0, -1, function (err, items) {
    if(err){
      callback(null, err)
    }else{
      callback(items, null)
    }
  })
}

var redisManager = {
	setKeyValue: setKeyValue,
	getValueByKey: getValueByKey,
  addToList: addToList,
  getList: getList,
  removeFromList: removeFromList
}

module.exports = redisManager;
