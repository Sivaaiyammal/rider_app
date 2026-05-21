const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('locationtracking');
  const trip = await db.collection('trips').find({_id: new ObjectId('6a0f27680044377ff719a351')}).toArray();
  console.log(JSON.stringify(trip, null, 2));
  await client.close();
}
run();
