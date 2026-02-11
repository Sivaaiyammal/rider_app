const Driver = require("../../Models/Driver");
const LiveLocation = require("../../Models/LiveLocation");
const Session = require("../../Models/Session");
const Trip = require("../../Models/Trip");

module.exports = function (CLASS) {
    CLASS.prototype.addTripLocationDriver = async function (req, res) {
        const driverId = req.driver.id;
        const payload = req.body;

        if (!payload) return res.status(400).json({ success: false, message: 'Payload not found', details: [] });

        try {
            if (payload.sessionId === "null" || payload.id === "null") {
                const driverLastCoordinate = payload.locations[payload.locations.length - 1];
                await Driver.updateLiveDriverMovements(driverId, driverLastCoordinate);
                console.log("Driver Moment added");
                return res.status(200).json({ success: true, message: 'Driver Moment added', details: [] });
            }
            console.log("Driver Trip Moment added");
            const tripId = payload.sessionId;
            const trip = await Trip.getTripById(tripId)
            if (!trip) return res.status(400).json({ success: false, message: 'Trip not found', details: [] });
            /*
            TODO
                -> Check if the trip is already completed
                -> check if the driver has access to this trip
            */

            const sessionData = {
                id: payload.id,
                sessionId: payload.sessionId,
                sessionName: payload.sessionName,
                startTime: new Date(),
                deviceType: payload.deviceType,
                deviceName: '',
                status: payload.completed ? 'completed' : 'live',
                sessionType: "REAL"
            }

            const driverLastCoordinate = payload.locations[payload.locations.length - 1]
            const lastCoordinateDetails = {
                type: "Point",
                coordinates: driverLastCoordinate.location,
                tripId: tripId,
                updatedAt: new Date(driverLastCoordinate.time).getTime() || new Date().getTime(),
            }
            const driverLastLocationDetail = {
                location: lastCoordinateDetails,
                liveStats: {
                    battery: driverLastCoordinate.battery,
                    speed: driverLastCoordinate.speed,
                    lastLocationUpdatedOn: new Date(driverLastCoordinate.time).getTime(),
                    course: driverLastCoordinate.heading,
                    activity: driverLastCoordinate.activity,
                },
                status: "online",
            }
           
            let existingSession = undefined
            if (sessionData.sessionId) {
                existingSession = await Session.checkSessionExists(sessionData.sessionId);
                if (existingSession && existingSession.status === 'completed') {
                    return res.status(400).json({ success: false, message: 'Session already completed', details: [] });
                }
            }

            this.getValidSocketIdsForTrip(req.socketService, tripId, lastCoordinateDetails, driverLastLocationDetail)

            // If session exists, add location to that session
            if (existingSession) {
                await LiveLocation.addLocations(payload.locations, payload.sessionId, payload.id);
                await Driver.updateLiveStatsAndLocation(driverId, driverLastLocationDetail.location, driverLastLocationDetail.liveStats);
                if (payload.completed) {
                    sessionData.endTime = new Date(payload.locations[payload.locations.length - 1].time);
                    await Session.updateStatus(payload.sessionId, 'completed', sessionData.endTime)
                }
                return res.status(200).json({ success: true, message: 'Locations added', details: [] });
            }
            const startTime = new Date(payload.locations[0].time);
            sessionData.startTime = startTime;
            if (payload.completed) {
                sessionData.endTime = new Date(payload.locations[payload.locations.length - 1].time);
            }
            await Session.createSession(sessionData)
            await LiveLocation.addLocations(payload.locations, payload.sessionId, payload.id);
            await Driver.updateLiveStatsAndLocation(driverId, driverLastLocationDetail.location, driverLastLocationDetail.liveStats);
            return res.status(200).json({ success: true, message: 'Locations added', details: [] });

        } catch (err) {
            console.log(err)
            this.handleError(err, res)
        }
    }
}