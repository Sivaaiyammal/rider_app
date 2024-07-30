import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { useStackScreenStore } from '../../Store/useStackScreen';
import SearchInput from './searchInput';
import TargetLocation from './targetLocation';
import POIScreen from './POIScreen';
import SearchScreen from './SearchScreen';

const ContentScreen = ({ setDragHeight }) => {
    const { setStackScreen } = useStackScreenStore();
    const [targetLocation, setTargetLocation] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('Home');

    const handleCurrentScreen = (screen, data) => {
        if (screen === 'TargetLocation') {

            setCurrentScreen(screen);

            setTargetLocation(data);
        } else if (screen === 'Search') {
            setStackScreen(screen);
        } else {
            setCurrentScreen(screen);
        }

    }

    return (
        <View style={styles.screenContainer}>
            {currentScreen !== 'TargetLocation' && (
                <SearchInput
                    searchText={''}
                    setCurrentScreen={handleCurrentScreen}
                    focused={true}
                />
            )}
            {currentScreen === 'Home' && <POIScreen />}
            {/* {currentScreen === 'Search' && (
                <SearchScreen
                    searchText={searchText}
                    searchData={searchData}
                />
            )} */}
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