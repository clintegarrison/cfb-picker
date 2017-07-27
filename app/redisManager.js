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

var redisManager = {
	setKeyValue: setKeyValue,
	getValueByKey: getValueByKey
}

module.exports = redisManager;
