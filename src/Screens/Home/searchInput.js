import React, { useState } from "react";

import InputContainer from "../../Components/InputContainer";
import { SearchAPI } from "../../Constants/NEMap/Search";

const SearchInput = ({searchText, setCurrentScreen, setDragHeight, setSearchText, setSearchData }) => {
    const [loading, setLoading] = useState(false);
    const search = new SearchAPI();

    const handleSearch = (value) => {
        setLoading(true);
        setSearchText(value);
        reverseGeocode(value);
    }

    const reverseGeocode = async (value) => {
        const response = await search.search(value);
        const formattedData = response.features.map(feature => ({
            catId: feature.properties.osm_id,
            title: feature.properties.type,
            data: [{
                id: feature.properties.osm_id,
                name: feature.properties.name,
                address: `${feature.properties.street}, ${feature.properties.city}, ${feature.properties.state} ${feature.properties.postcode}`,
                duration: `${(feature.score * 10).toFixed(0)}m away`,
                coordinates: feature.geometry.coordinates,
            }]
        }));

        setSearchData(formattedData);
        setLoading(false);
    }

    const clearText = () => {
        setSearchText('');
    };

    return (
        <InputContainer
            placeholder={'Search'}
            onFocus={() => {
                // setDragHeight(800);
                setCurrentScreen('Search');
            }}
            value={searchText}
            loading={loading}
            onChange={handleSearch}
            onCancelPress={() => clearText()}
        />
    )
}

export default SearchInput;