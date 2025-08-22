import ApiConfig from '../../Config/APIURLConfig';

export async function findRoute(points) {
    if (!points) return null;
 
    const latlngs = points.map(item => {
        return {
            lat: item.location ? item.location[1] : item.lat,
            lon: item.location ? item.location[0] : item.lon,
        };
    });
    
    
    

    const jsonObject = {
        costing: 'auto',
        costing_options: {},
        language: 'en',
        locations: latlngs,
        units: 'kilometers',
    };
    
    try {
        const jsonString = JSON.stringify(jsonObject);
        // const encodedData = encodeURIComponent(jsonString);
        const url = `${ApiConfig.ROUTE_API_URL}?data=${jsonString}&access_token=${ApiConfig.NE_ACCESS_TOKEN}`;

    
        
        const response = await fetch(url, {
            method: 'GET',
        });
        
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('response',response);
        
        const routeData = await response.json();
        return routeData;
    } catch (error) {
        console.error("Error fetching route:", error);
        return null;
    }
}