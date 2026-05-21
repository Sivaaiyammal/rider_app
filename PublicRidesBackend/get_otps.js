const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('locationtracking');
  const trips = await db.collection('trips').find({}).sort({_id: -1}).limit(5).toArray();
  trips.forEach(t => console.log(`Trip ${t._id} - Status: ${t.status} - OTP: ${t.otp} - isActing: ${t.isActingDriverTrip}`));
  await client.close();
}
run();
