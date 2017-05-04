import amqp from 'amqplib';
import  {MongoClient} from 'mongodb';
import {sumBy} from 'lodash';

console.log("**************************************************");
console.log("START");
console.log("**************************************************");

const timestamp = ()=> {
  const [seconds, nanos] = process.hrtime();
  return seconds * 1e9 + nanos;
};


// Connection URL
var url = 'mongodb://mongo:27017/events';
// Use connect method to connect to the Server
MongoClient.connect(url).then((db)=>{
  console.log("Connexion to Mongo.");
  db.collection('snapshot').ensureIndex({id:1},{background:true});
  db.collection('state').ensureIndex({id:1},{background:true});

  amqp.connect(process.env.RABBITMQ_URL).then((conn)=>{
    conn.createChannel().then((ch)=>{
      ch.assertQueue('normalizer.event', {durable: true, ack:process.env.ACK?true:false});
      ch.prefetch(parseInt(process.env.PREFETCH || 256));
      ch.consume('normalizer.event', async (msg)=> {
        const event = JSON.parse(msg.content.toString());
        const time = timestamp();

        const snapshot = await db.collection('snapshot').findOne({id:event.id});

        let events;
        let amount;
        if (snapshot){
          events = await db.collection('events').find({id:event.id, timestamp: {$gt: snapshot.timestamp}}).sort({timestamp:1}).toArray();
          amount = snapshot.amount + sumBy(events,(e)=>e.payload.amount);
        }
        else {
          events = await db.collection('events').find({id:event.id}).sort({timestamp:1}).toArray();
          amount = sumBy(events,(e)=>e.payload.amount);
        }

        if (events.length>10) {
          await db.collection('snapshot').updateOne({id: event.id},{$set:{id: event.id, amount, timestamp: events[events.length-1].timestamp }},{upsert:true});
          console.log('snapshot');
        }

        //    console.log(event.handle,  amount, events.length);
        await db.collection('state').updateOne({id: event.id},{$set:{id: event.id, amount }},{upsert:true});
        if (process.env.ACK)
          ch.ack(msg);

        const diff = (timestamp() - time)/1e6 ;
        const diff2 = (timestamp() - event.timestamp)/1e6 ;
        console.log("**",diff,'/',diff2,'ms', events.length );
      });
    });
  });
});
