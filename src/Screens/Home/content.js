import { useState } from 'react';
import { View, StyleSheet } from 'react-native';


import SearchInput from './searchInput';
import TargetLocation from './targetLocation';
import POIScreen from './POIScreen';
import SearchScreen from './SearchScreen';

const ContentScreen = ({ setDragHeight }) => {
    const [searchText, setSearchText] = useState('');
    const [searchData, setSearchData] = useState([]);
    const [targetLocation, setTargetLocation] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('Home');

    const handleCurrentScreen = (screen, data) => {
        setCurrentScreen(screen);
        if (screen === 'TargetLocation') {

            setCurrentScreen(screen);

            setTargetLocation(data);
        }
    }

    return (
        <View style={styles.screenContainer}>
            {currentScreen !== 'TargetLocation' && (
                <SearchInput
                    searchText={searchText}
                    setDragHeight={setDragHeight}
                    setCurrentScreen={handleCurrentScreen}
                    setSearchText={setSearchText}
                    setSearchData={setSearchData}
                />
            )}
            {currentScreen === 'Home' && <POIScreen />}
            {currentScreen === 'Search' && (
                <SearchScreen
                    searchText={searchText}
                    searchData={searchData}
                    setCurrentScreen={handleCurrentScreen}
                />
            )}
            {/* {currentScreen === 'TargetLocation' &&
                <TargetLocation
                    data={targetLocation}
                    setCurrentScreen={handleCurrentScreen}
                />} */}
        </View>
    )
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default ContentScreen;