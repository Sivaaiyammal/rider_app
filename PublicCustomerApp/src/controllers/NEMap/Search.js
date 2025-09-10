import ApiConfig from "../../Config/APIURLConfig";

class SearchAPI {
    static CACHE = {};

    constructor(accessToken = ApiConfig.NE_ACCESS_TOKEN) {
        this.accessToken = accessToken

        this.searchAbortController = null
    }

    async search(locationName) {
        if (this.searchAbortController) this.searchAbortController.abort()
        this.searchAbortController = new AbortController()

        let searchText = locationName

        let response = await fetch(`${ApiConfig.NE_ROOT_URL}/search/api?access_token=${this.accessToken}&q=${searchText}&lang=en&limit=10`, { signal: this.searchAbortController.signal })
        let data = await response.json()

        return data;
    }

    async reverseGeocode(location, onlyAddress = false) {
        if (this.searchAbortController) this.searchAbortController.abort()
        this.searchAbortController = new AbortController()

        const longitude = location[1],
            latitude = location[0]

        if (SearchAPI.CACHE[longitude + latitude]) return SearchAPI.CACHE[longitude + latitude]
        let response = await fetch(`${ApiConfig.NE_ROOT_URL}/search/reverse?access_token=${this.accessToken}&lat=${latitude}&lon=${longitude}`, { signal: this.searchAbortController.signal })
        let data = await response.json()
        let { features } = data
        /* Return the best result */
        if (onlyAddress) {
            let { properties } = features[0]
            let { name, city, state, country } = properties
            const parts = [name, city, state, country];
            let place = parts.filter(Boolean).join(", ");
            SearchAPI.CACHE[longitude + latitude] = place
            return place
        }
        return features?.[0] || "unnamed"

    }

}

export default SearchAPI;



