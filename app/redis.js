var redis = require('redis')
console.log(process.env.REDIS_URL)

var client = redis.createClient(process.env.REDIS_URL);

function setKeyValue(key, value){
  client.set(key, value, redis.print);
}

function getValueByKey(key, callback){
  client.get(key, function (err, reply) {
    if(err){
      throw err
    }else{
      callback(reply.toString())
    }
  });
}
