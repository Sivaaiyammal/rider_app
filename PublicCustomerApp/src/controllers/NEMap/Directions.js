import ApiConfig from "../../Config/APIConfig.js";
const polyline = require('polyline');

class DirectionAPI {

    constructor(accessToken = ApiConfig.NE_ACCESS_TOKEN) {
        this.accessToken = accessToken

        this.directionsAbortController = null
    }

    async findValhalla(points, distanceDurationonly = false) {
        let baseURL = "http://zeus.virtualmaze.in/router/route?data="
        points = points.map(loc => { return { 'lat': parseFloat(loc[1] || 0), 'lon': parseFloat(loc[0] || 0) } })
        let payload = {
            "locations": points,
            "directionsOptions": { "units": "kilometers" },
            "costing":  "taxi",
        }
        let url = baseURL + JSON.stringify(payload)

        const options = {
            url: url,
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        let response = await fetch(url, options)
        response = await response.json()


        if (response && response.trip && Object.keys(response.trip).length) {
            let trip = response.trip
            let { time, length } = trip.summary
            let duration = parseFloat(time) / 60
            let distance = length
            if (distanceDurationonly) return [distance, duration]
            let {legs} = trip
            let route_track = []

            legs.forEach(leg => {
                let shape = leg.shape
                let track = polyline.decode(shape, 6)
                route_track.push(...track)
            })
            return route_track;
        }

        return false

    }

    async find(locations, distanceDurationonly = false) {
        if (this.directionsAbortController) this.directionsAbortController.abort()
        this.directionsAbortController = new AbortController()

        let locationString = ""
        locations.forEach((location, index) => {
            locationString += `${location[1]},${location[0]}`
            if (index != locations.length - 1) locationString += ";"
        })
        let url = `${ApiConfig.NE_ROOT_URL}/router/route?access_token=${this.accessToken}&points=${locationString}`
        let response = await fetch(url, { signal: this.directionsAbortController.signal })
        let data = await response.json()
        let route = data.routes[0]
        if (!route) return null

        let { duration, distance } = route
        distance = distance / 1000
        duration = duration / 60

        if (distanceDurationonly) return [distance, duration]
        let decodedPoints = polyline.decode(route.geometry, 6)
        // reverse the lat and lng
        decodedPoints = decodedPoints.map(point => [point[1], point[0]])
        return decodedPoints;
    }

}

module.exports = { DirectionAPI };