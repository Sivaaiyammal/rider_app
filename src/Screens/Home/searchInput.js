import React, { useState, useEffect } from "react";

import InputContainer from "../../Components/InputContainer";
import useMapStore from "../../Store/useMapStore";
import { useStackScreenStore } from "../../Store/useStackScreen";

const SearchInput = ({searchText, setCurrentScreen, focused, setSearchText, setSearchData, closeBtn }) => {
    const [loading, setLoading] = useState(false);
    const { setSearchUnit, onSearchResults } = useMapStore();
    const { setStackScreen } = useStackScreenStore();

    useEffect(() => {
        if(onSearchResults){
            setLoading(false);
        }
    }, [onSearchResults]);
    
    const handleSearch = (value) => {
        setLoading(true);
        setSearchText(value);
        setSearchUnit(value);
    }

    const clearText = () => {
        setSearchText('');
        setLoading(false);
        setStackScreen('Home');
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
            onCancelPress={closeBtn ? () => clearText() : undefined}
            autoFocus={!focused}
        />
    )
}

export default SearchInput;