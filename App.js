/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

/* Custom Modules */

import SplashScreen from './CustomerComponent/SplashScreen/splash';
import LanguageScreen from './CustomerComponent/LanguageScreen/LanguageScreen';
import Authentication from './CustomerComponent/LanguageScreen/Authentication';
import Registeration from './CustomerComponent/LanguageScreen/Registeration';
import OnBoard from './CustomerComponent/OnboardingScreen/onBorad';
import HomeMainScreen from './CustomerComponent/Home/HomeMainScreen';
import PermissionHandler from './Controllers/PermissionHandler';
import NotificationContainer from './Components/Notification/NotificationContainer';
import {LanguageProvider} from 'react-native-translation';
import GlobalStateProvider from './CustomerComponent/Store/CreateStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    PermissionHandler();
  }

  render() {
    const MyTheme = {
      dark: false,
      colors: {
        primary: '#2785ff',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(199, 199, 204)',
        notification: 'rgb(255, 69, 58)',
      },
    };

    return (
      <GlobalStateProvider>
        <LanguageProvider language={'en'}>
          <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={{ flex: 1 }}>
              <NavigationContainer theme={MyTheme}>
                <Stack.Navigator
                  initialRouteName="SplashScreen"
                  screenOptions={{headerShown: false}}>
                  {/* Splash Screen */}
                  <Stack.Screen name="SplashScreen" component={SplashScreen} />

                  {/* Choose Language Screen */}
                  <Stack.Screen
                    name="LanguageScreen"
                    component={LanguageScreen}
                  />
                  {/* <Stack.Screen name="IntroScreen" component={IntroScreen} /> */}

                  {/* Onboard Screen */}
                  <Stack.Screen name="OnboardScreen" component={OnBoard} />

                  {/* Authentication Screen */}
                  <Stack.Screen
                    name="RegisterationScreen"
                    component={Registeration}
                  />
                  <Stack.Screen
                    name="AuthenticationScreen"
                    component={Authentication}
                    initialParams={{app_type: 'customer'}}
                  />

                  {/* Home screen */}
                  <Stack.Screen name="HomeScreen" component={HomeMainScreen} />

                  {/* <Stack.Screen name="Trip" component={DraggableBottomSheet} /> */}
                </Stack.Navigator>
              </NavigationContainer>
              <NotificationContainer />
            </SafeAreaView>
          </GestureHandlerRootView>
        </LanguageProvider>
      </GlobalStateProvider>
    );

    // return <NEMap mapStyle={{height:300,width:"100%"}}/>
    // return <AuthenticationScreen/>
  }
}

export default App;
