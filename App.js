import { StyleSheet, Text, useColorScheme, View } from "react-native";
import React, { useCallback, useEffect } from "react";
import Navigation from "./src/Navigation/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import { ContextProvider } from "./src/Context/GlobalContext";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { DataStore } from "./src/Constants/DataStore";

const App = () => {

  const appearance = useColorScheme();
  const setAppTheme = useCallback(async () => {
    const IS_FIRST = await DataStore.loadData('IS_FIRST');
    if (IS_FIRST.data === null) {
      DataStore.storeData('Theme', appearance);
      DataStore.storeData('IsDefault', true);
      DataStore.storeData('IS_FIRST', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAppTheme();
  }, [setAppTheme]);

  return (
    <AlertNotificationRoot theme="light">
      <ContextProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </ContextProvider>
    </AlertNotificationRoot>
  );
};

export default App;
