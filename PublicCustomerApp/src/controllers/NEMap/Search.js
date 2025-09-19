import Config from "react-native-config";

class SearchAPI {
    static CACHE = {};

    constructor(accessToken = Config.NE_ACCESS_TOKEN) {
        this.accessToken = accessToken

        this.searchAbortController = null
    }

    async search(locationName) {
        if (this.searchAbortController) this.searchAbortController.abort()
        this.searchAbortController = new AbortController()

        let searchText = locationName

        let response = await fetch(`${Config.NE_ROOT_URL}/search/api?access_token=${this.accessToken}&q=${searchText}&lang=en&limit=10`, { signal: this.searchAbortController.signal })
        let data = await response.json()

        return data;
    }

    async reverseGeocode(longitude, latitude) {
        if (this.searchAbortController) this.searchAbortController.abort()
        this.searchAbortController = new AbortController()
        


        if (SearchAPI.CACHE[longitude + latitude]) return SearchAPI.CACHE[longitude + latitude]
        let response = await fetch(`${Config.NE_ROOT_URL}?data={"addDebugInfo":false,"input":"${longitude},${latitude}","language":"en","limitResults":10,"mapunit":"india","sections":["reverse_geocode"],"userPos":[${longitude},${latitude}],"version":"1.2.0.0"}`, { signal: this.searchAbortController.signal })
        let data = await response.json()
        
        let { reverse_geocode } = data;

     
        if (reverse_geocode && reverse_geocode.length > 0) {
            const addressData = reverse_geocode[0].address;
            const placeName = reverse_geocode[0].place_name[0];
            SearchAPI.CACHE[longitude + latitude] = { address: addressData, placeName: placeName };
            

            const res={}
            if (
                Array.isArray(addressData) &&
                addressData.filter(item => item !== "").length > 0
            ) {
                
                res.address = addressData
                    
            }

            if(placeName) {
                res.placeName = placeName;
            }else{
                res.placeName = "Unnamed Location";
            }

            return res;
        }
            
        return { address: null, placeName: "Unnamed Location" };

        

    }

}

export default SearchAPI;



