class DriverLocationHandler {
    constructor(publicRidesCustomerNamespace, realtimeServerNamespace) {
        this.publicRidesCustomerNamespace = publicRidesCustomerNamespace;
        this.realtimeServerNamespace = realtimeServerNamespace;
    }

    emitDriverLocationUpdate(socketIds, location) {
        socketIds.forEach(socketId => {
            const socket = this.publicRidesCustomerNamespace.sockets.get(socketId);
            if (socket && socket.connected) {
                socket.emit('driverLocationUpdate', location);
            }
        });
    }

    // initializeRealTimeServerListeners(socket) {
    //     socket.on('driverLocationUpdate', async (data) => {
    //         try {
    //             const { tripId } = data
    //             const results = await getUserWhoHaveAccessToTrip(tripId)
    //             const validSocketIds = results
    //             Redis.storeDataWithExpiry(tripId + "_socket_ids", JSON.stringify(validSocketIds), 60 * 5)
    //             this.emitDriverLocationUpdate(validSocketIds, { tripId, data: { location: data.location, liveStats: data.liveStats } })

    //         } catch (err) {
    //             console.log(err, "err", data)
    //         }
    //     })
    // }
}

module.exports = DriverLocationHandler