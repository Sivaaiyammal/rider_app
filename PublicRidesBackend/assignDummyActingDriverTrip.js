const { MongoClient, ObjectId } = require('mongodb');

async function assignDummyActingDriverTrip() {
    const client = new MongoClient("mongodb://localhost:27017");
    try {
        await client.connect();
        const db = client.db("locationtracking");
        
        console.log("Connected to MongoDB database: locationtracking");

        // 1. Fetch Passenger (use first passenger found)
        const passenger = await db.collection('passangers').findOne({});
        if (!passenger) {
            console.error("❌ No passengers found in database. Please register/create a passenger first.");
            return;
        }
        console.log(`👤 Found passenger: ${passenger.name || 'N/A'} (ID: ${passenger._id}, Phone: ${passenger.phone})`);

        // 2. Fetch and configure the specific Driver
        const driverIdStr = '6a06e6c0429a65b98fd75084';
        let driver = await db.collection('drivers').findOne({ _id: new ObjectId(driverIdStr) });
        if (!driver) {
            console.warn(`⚠️ Driver with ID ${driverIdStr} not found. Fetching first available driver as fallback...`);
            driver = await db.collection('drivers').findOne({});
            if (!driver) {
                console.error("❌ No drivers found in database. Please register/create a driver first.");
                return;
            }
        }

        // Update driver to ensure they are approved and set to acting_driver mode
        await db.collection('drivers').updateOne(
            { _id: driver._id },
            { 
                $set: { 
                    mode: "acting_driver",
                    isPublicRidesDriver: true,
                    isApproved: true,
                    isAvailable: true,
                    tripStatus: "NOTRIP"
                } 
            }
        );
        driver = await db.collection('drivers').findOne({ _id: driver._id });
        console.log(`🚗 Found & configured Acting Driver: ${driver.name || 'N/A'} (ID: ${driver._id}, Phone: ${driver.phone})`);

        // 3. Clear any existing active trips for passenger & driver to ensure a clean state
        console.log("🧹 Clearing any previous active/ongoing trips for this passenger and driver...");
        await db.collection('trips').updateMany(
            { 
                $or: [
                    { passangerId: passenger._id, status: { $in: ["ACCEPTED", "PICKEDUP", "STARTED", "PENDING"] } },
                    { driverId: driver._id, status: { $in: ["ACCEPTED", "PICKEDUP", "STARTED", "PENDING"] } }
                ] 
            },
            { $set: { status: "CANCELLED", cancelReason: "Cleaned up by dummy script" } }
        );

        // Coordinates for SAP Theatre and New Bus Stand Tiruppur (Longitude, Latitude)
        const pickupCoords = [77.3361, 11.1207]; // Approx SAP Theatre, Tiruppur
        const dropCoords = [77.3402, 11.1256];   // Approx New Bus Stand, Tiruppur

        // 4. Construct Acting Driver Trip Payload for NOW
        const regionalCode = "NOT";
        const now = new Date();
        const nowTimestamp = now.getTime();

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const currentDateStr = `${day}${month}${year}`;
        const random5digits = Math.floor(10000 + Math.random() * 90000);
        const rideId = `AD${regionalCode}${currentDateStr}${random5digits}`;

        const tripPayload = {
            rideId: rideId,
            bookingTime: nowTimestamp,
            status: "ACCEPTED",
            publicRidesTrip: true,
            isActingDriverTrip: true,
            actingDriverHours: 4,
            passangerVehicleId: "TN-39-BY-1234",
            passangerVehicleType: "CAR",
            bookingFor: "MYSELF",
            bookingForName: passenger.name || "Customer",
            bookingForPhone: passenger.phone || "",
            passangerId: passenger._id,
            createdBy: passenger._id.toString(),
            userId: passenger._id,
            driverId: driver._id,
            otp: "1234",
            startLocation: {
                type: "Point",
                coordinates: pickupCoords,
                name: "SAP Theatre",
                address: "SAP Theatre, Avinashi-Tiruppur Road, Tiruppur"
            },
            endLocation: {
                type: "Point",
                coordinates: dropCoords,
                name: "New Bus Stand",
                address: "New Bus Stand, PN Road, Tiruppur"
            },
            distance: 5,
            duration: 15,
            estimatedDistance: 5,
            estimatedDuration: 15,
            vehicleType: "CAR", // Custom customer car class
            minFare: 250,
            maxFare: 300,
            estimatedFare: 275,
            regionCode: "NOT",
            stops: [
                {
                    name: "SAP Theatre",
                    location: { type: "Point", coordinates: pickupCoords },
                    address: "SAP Theatre, Avinashi-Tiruppur Road, Tiruppur",
                    isReached: false,
                    waitingTime: 0
                },
                {
                    name: "New Bus Stand",
                    location: { type: "Point", coordinates: dropCoords },
                    address: "New Bus Stand, PN Road, Tiruppur",
                    isReached: false,
                    waitingTime: 0
                }
            ],
            createdOn: now.getTime(),
            updatedOn: now.getTime()
        };

        // 5. Insert Trip
        const result = await db.collection('trips').insertOne(tripPayload);
        const tripId = result.insertedId;
        console.log(`✅ Dummy Acting Driver ACCEPTED trip created successfully for NOW!`);
        console.log(`Trip ID: ${tripId} | Ride ID: ${rideId} | OTP: 1234`);

        // 6. Update Driver: set tripStatus to "ACCEPTED" and currentTripId to tripId
        await db.collection('drivers').updateOne(
            { _id: driver._id },
            { 
                $set: { 
                    currentTripId: tripId,
                    tripStatus: "ACCEPTED",
                    location: { type: "Point", coordinates: pickupCoords },
                    homeLocation: { type: "Point", coordinates: pickupCoords },
                    isAvailable: false
                }
            }
        );
        console.log(`✅ Driver ${driver.name} set to "ACCEPTED" with current active trip.`);

        // 7. Update Passenger: link to latestTripId
        await db.collection('passangers').updateOne(
            { _id: passenger._id },
            {
                $set: {
                    latestTripId: tripId
                }
            }
        );
        console.log(`✅ Passenger ${passenger.name} updated with latestTripId linked to trip.`);
        console.log("\n🚀 Setup Complete! You can now test the flow: ");
        console.log("   Driver App -> Appears immediately as active trip. Driver can arrive, upload pre-trip photos, enter OTP '1234' to start, end trip, etc.");
        console.log("   Passenger App -> User can see 'Bills & Photos' button and view uploaded photos!");

    } catch (e) {
        console.error("❌ Error setting up dummy acting driver trip:", e);
    } finally {
        await client.close();
    }
}

assignDummyActingDriverTrip();
