import amqp from 'amqplib';

console.log("**************************************************");
console.log("START");
console.log("**************************************************");

const timestamp = ()=> {
  const [seconds, nanos] = process.hrtime();
  return seconds * 1e9 + nanos;
};

const msgpermilli = process.env.MSG_PER_MILLI || 2;

amqp.connect(process.env.RABBITMQ_URL).then((conn)=>{
  conn.createChannel().then((ch)=>{
    ch.assertQueue('main.event', {durable: true});
    setInterval(function () {
      setImmediate(async ()=>{
        for (let i=0;i<msgpermilli; i++){
          const id = Math.round(Math.random()*10000);

          await ch.sendToQueue('main.event',
	                         new Buffer(JSON.stringify({type:'update',
			                                                timestamp: timestamp(),
			                                                id,
			                                                payload: {
				                                                amount: Math.random()*20000 - 10000
			                                                }
				                                             }, {persistent: true})));
        }
      });
    }, 1);
  });
});
