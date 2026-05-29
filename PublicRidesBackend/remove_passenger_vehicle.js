const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node remove_passenger_vehicle.js <passenger_phone> <vehicle_reg_no>');
    console.log('Example: node remove_passenger_vehicle.js 9876543210 TN01AB1234');
    process.exit(1);
  }

  const phone = args[0].trim();
  const regNo = args[1].trim().toUpperCase().replace(/[\s-]/g, '');

  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    const db = client.db('locationtracking');

    // 1. Find the passenger
    console.log(`Searching for passenger with phone: ${phone}`);
    const passenger = await db.collection('passangers').findOne({ phone });
    if (!passenger) {
      console.error(`Error: Passenger with phone number "${phone}" not found.`);
      process.exit(1);
    }
    console.log(`Passenger found: "${passenger.name}" (ID: ${passenger._id})`);

    // 2. Find the vehicle belonging to this passenger
    console.log(`Searching for vehicle with registration number: ${regNo}`);
    const vehicle = await db.collection('vehicles').findOne({
      regNo,
      passangerId: passenger._id
    });

    if (!vehicle) {
      console.error(`Error: Vehicle "${regNo}" not found for passenger "${passenger.name}".`);
      process.exit(1);
    }
    console.log(`Vehicle found: ${vehicle.make} ${vehicle.model} (ID: ${vehicle._id})`);

    // 3. Mark the vehicle as deleted in vehicles collection
    console.log('Marking vehicle as deleted in "vehicles" collection...');
    const vehicleUpdateResult = await db.collection('vehicles').updateOne(
      { _id: vehicle._id },
      { 
        $set: { 
          isDeleted: true, 
          deletedAt: new Date() 
        } 
      }
    );

    if (vehicleUpdateResult.modifiedCount > 0) {
      console.log('Successfully marked vehicle as deleted.');
    } else {
      console.log('Vehicle was already marked as deleted or no changes made.');
    }

    // 4. Remove vehicle ID from passenger's vehicles list
    console.log('Removing vehicle ID from passenger\'s "vehicles" array...');
    
    // Check if the passenger's vehicles array contains vehicle._id as ObjectId or String
    const passengerUpdateResult = await db.collection('passangers').updateOne(
      { _id: passenger._id },
      { 
        $pull: { 
          vehicles: { 
            $in: [vehicle._id, vehicle._id.toString()] 
          } 
        } 
      }
    );

    if (passengerUpdateResult.modifiedCount > 0) {
      console.log('Successfully removed vehicle from passenger profile.');
    } else {
      console.log('Vehicle was not found in passenger\'s "vehicles" list or no changes made.');
    }

    console.log('\nVehicle removal completed successfully.');
  } catch (error) {
    console.error('An error occurred during execution:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

run();
