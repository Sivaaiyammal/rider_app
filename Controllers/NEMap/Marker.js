
const markerTypes = ['driver', 'marker_start', 'marker_end', 'waypoint', 'car', 'default', "car_red", "car_yellow", "car_green"]
const markerSizes = [24, 36, 48]

class Marker {

    /**
     * Represents a marker on the map.
     * @param {string} id - The ID of the marker.
     * @param {string} name - The name of the marker.
     * @param {number} lng - The longitude of the marker.
     * @param {number} lat - The latitude of the marker.
     * @param {string} type - The type of the marker. Default is "default".
     * @param {number} size - The size of the marker. Default is 36.
     */
    constructor(id, name, lng, lat, type = "default", size = 36, selected=false) {

        if (!markerTypes.includes(type)) {
            throw new Error("Invalid marker type");
        }


        if (!markerSizes.includes(size)) {
            throw new Error("Invalid marker size");
        }


        this.id = id;
        this.name = name;
        this.lng = lng;
        this.lat = lat;
        this.type = type;
        this.size = size;
        this.selected = selected;
        this.angle = 0
        this.focus = false
    }

    setFocus(focus){
        this.focus = focus
    }

    setPosition(lng, lat){
        this.lng = lng
        this.lat = lat
    }

    setSnippet(snippet){
        this.snippet = snippet
    }

    setTitle(title){
        this.title = title
    }

    setAngle(angle){
        this.angle = angle
    }

}

export default Marker