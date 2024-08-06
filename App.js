import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Navigation from "./src/Navigation/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import { ContextProvider } from "./src/Context/GlobalContext";
import { AlertNotificationRoot } from "react-native-alert-notification";

const App = () => {
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
