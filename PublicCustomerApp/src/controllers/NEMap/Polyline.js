

class polyline{

    constructor(id, name, coordinates,color="#212121",width=1){
        this.id = id;
        this.name = name;
        this.coordinates = coordinates
        // color must be in hex code
        this.color = color
        this.width = width
    }

}

export default polyline