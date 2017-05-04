import amqp from 'amqplib';
import  {MongoClient} from 'mongodb';

console.log("**************************************************");
console.log("START");
console.log("**************************************************");

// Connection URL
var url = 'mongodb://mongo:27017/events';
// Use connect method to connect to the Server
MongoClient.connect(url).then((db)=>{
  console.log("Connexion to Mongo.");
  db.collection('events').ensureIndex({id:1,timestamp:1},{background:true});
  amqp.connect(process.env.RABBITMQ_URL).then((conn)=>{
    conn.createChannel().then((ch)=>{
      ch.assertQueue('main.event', {durable: true, ack:process.env.ACK?true:false});
      ch.assertQueue('normalizer.event', {durable: true});
      ch.prefetch(parseInt(process.env.PREFETCH || 256));
      ch.consume('main.event', async (msg)=> {
        const event = JSON.parse(msg.content.toString());
        //  Bus.listen('main.event', {ack:process.env.ACK?true:false}, async (event) => {
        await db.collection('events').insertOne(event);

        ch.sendToQueue('normalizer.event',
	                     new Buffer(JSON.stringify({type:'update',
	                                                timestamp: event.timestamp,
	                                                id: event.id
	                                               })),
                       {persistent: true}); //, ack:process.env.ACK?true:false});
        if (process.env.ACK)
          ch.ack(msg);
      }).catch((err)=>{
        console.error( err);
      });
    });
  });
});
