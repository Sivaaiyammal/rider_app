import React, { useEffect } from 'react';
import { View } from 'react-native';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import { useNavigation, CommonActions } from '@react-navigation/native';

import SplashImage from '../Assets/splash/splash.svg';
import { DataStore } from '../Constants/DataStore';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        setTimeout(async () => {

            const language = await DataStore.loadData("language");
            console.log(language, "language");
            if (language.data) {
                navigation.dispatch(
                    CommonActions.navigate('Home')
                )
            } else {
                navigation.navigate("LanguageScreen");
            }
        }, 3000);
    }, []);

    return (
        <View style={{
            flex: 1, 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            backgroundColor: '#fff',
            paddingBottom: 20
        }}>
            <SplashImage />
            <ProgressBar 
                styleAttr="Horizontal" 
                indeterminate={true} 
                color="blue" 
                style={{
                    width: '100%',
                    height: 10
                }} />
        </View>
    )
}

export default SplashScreen;