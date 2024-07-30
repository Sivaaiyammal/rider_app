import React, { useState } from "react";

import InputContainer from "../../Components/InputContainer";
import { SearchAPI } from "../../Constants/NEMap/Search";
import useMapStore from "../../Store/useMapStore";

const SearchInput = ({searchText, setCurrentScreen, focused, setSearchText, setSearchData }) => {
    const [loading, setLoading] = useState(false);
    const { setSearchUnit } = useMapStore();
    const search = new SearchAPI();
    
    const handleSearch = (value) => {
        setLoading(true);
        setSearchText(value);
        setSearchUnit(value);
    }

    // const reverseGeocode = async (value) => {
    //     const response = await search.search(value);
    //     const formattedData = response.features.map(feature => ({
    //         catId: feature.properties.osm_id,
    //         title: feature.properties.type,
    //         data: [{
    //             id: feature.properties.osm_id,
    //             name: feature.properties.name,
    //             address: `${feature.properties.street}, ${feature.properties.city}, ${feature.properties.state} ${feature.properties.postcode}`,
    //             duration: `${(feature.score * 10).toFixed(0)}m away`,
    //             coordinates: feature.geometry.coordinates,
    //         }]
    //     }));

    //     setSearchData(formattedData);
    //     setLoading(false);
    // }

    const clearText = () => {
        setSearchText('');
        setLoading(false);
    };

    return (
        <InputContainer
            placeholder={'Search'}
            onFocus={() => {
                // setDragHeight(800);
                if(focused) setCurrentScreen('Search');
            }}
            value={searchText}
            loading={loading}
            onChange={handleSearch}
            onCancelPress={() => clearText()}
            autoFocus={!focused}
        />
    )
}

export default SearchInput;