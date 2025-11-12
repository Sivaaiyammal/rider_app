import Config from "react-native-config";

export async function findRoute(points) {
    if (!points) return null;
 
    const latlngs = points.map(item => {
        return {
            lat: item.location ? item.location[1] : item.lat,
            lon: item.location ? item.location[0] : item.lon,
        };
    });
    
    
    

    const jsonObject = {
        costing: 'taxi',
        costing_options: {},
        language: 'en',
        locations: latlngs,
        units: 'kilometers',
    };
    console.log("Route Request Object:", jsonObject);
    
    try {
        const jsonString = JSON.stringify(jsonObject);
        const encodedData = encodeURIComponent(jsonString);
        const url = `${Config.ROUTE_API_URL}?data=${encodedData}&access_token=${Config.NE_ACCESS_TOKEN}`;
        console.log("Route Request URL:", url);

    
        
        const response = await fetch(url, {
            method: 'GET',
        });
        
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        
        
        const routeData = await response.json();
        console.log("Route Response Data:", JSON.stringify(routeData));
        return routeData;
    } catch (error) {
        console.error("Error fetching route:", error);
        return null;
    }
}