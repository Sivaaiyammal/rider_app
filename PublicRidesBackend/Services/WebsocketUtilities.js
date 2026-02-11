const Redis = require("../Controllers/DB/Redis")
const RideStatus = require("../Core/PublicRides/RideStatus")
const Device = require("../Models/Device")
const Trip = require("../Models/Trip")
const User = require("../Models/User")


async function getDeviceAndUsersWithAccess(deviceId) {
    const device = await Device.getDeviceFromId(deviceId)
    const results = await getUsersWhoHaveAccessToDevice(null, device)
    return [device, results]
}

async function getUserSocketIds(userId) {
    userId = String(userId)
    const socketIds = await Redis.mget([userId])
    
    const updatedSocketIds = socketIds.flatMap(ids => ids ? ids.split(',') : []);
    const validSocketIds = updatedSocketIds.filter(id => id !== null && id !== '');
    return validSocketIds
}





module.exports = {
    getDeviceAndUsersWithAccess,
   
    getUserSocketIds,
    
}

