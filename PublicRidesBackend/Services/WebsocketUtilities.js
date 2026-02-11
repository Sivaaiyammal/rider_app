const Redis = require("../Controllers/DB/Redis")
const RideStatus = require("../Core/PublicRides/RideStatus")
const Device = require("../Models/Device")
const Trip = require("../Models/Trip")



async function getUserSocketIds(userId) {
    userId = String(userId)
    const socketIds = await Redis.mget([userId])
    
    const updatedSocketIds = socketIds.flatMap(ids => ids ? ids.split(',') : []);
    const validSocketIds = updatedSocketIds.filter(id => id !== null && id !== '');
    return validSocketIds
}

async function getUserWhoHaveAccessToTrip(tripId) {
    console.log("getUserWhoHaveAccessToTrip", tripId)
    const trip = await Trip.getTripById(tripId)
    if (trip.status !== RideStatus.COMPLETED || trip.status !== RideStatus.CANCELLED) {
        const passangerId = String(trip.passangerId)
        console.log("passangerId", passangerId)
        const socketIds = await Redis.mget([passangerId])
        console.log("socketIds", socketIds,)
        const updatedSocketIds = socketIds.flatMap(ids => ids ? ids.split(',') : []);
        const validSocketIds = updatedSocketIds.filter(id => id !== null && id !== '');
        return validSocketIds
    }
}



module.exports = {
   
    getUserSocketIds,
    getUserWhoHaveAccessToTrip,
}

