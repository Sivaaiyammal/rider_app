import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Navigation from "./src/Navigation/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import { ContextProvider } from "./src/Context/GlobalContext";

const App = () => {
  return (
    <ContextProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </ContextProvider>
  );
};

export default App;
