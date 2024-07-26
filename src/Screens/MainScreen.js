import React from "react";

import { useStackScreenStore } from "../Store/useStackScreen";

import Map from "./Map";
import SearchScreen from "./Home/SearchScreen";
import HomeScreen from "./Home/HomeScreen";
import SettingsScreen from "./SettingsScreen";
import TargetLocation from "./Home/targetLocation";
import MultiStopStartEndLocation from "./Home/Routes/MultiStopStartEndLocation";

const MainScreen = () => {
  const { stackScreen } = useStackScreenStore();

  const renderScreen = () => {
    if (stackScreen.length === 0) {
      console.error("Error: stackScreen is empty");
      return null;
    }

    const currentScreen = stackScreen[stackScreen.length - 1];
    switch (currentScreen.screen) {
      case "Home":
        return <HomeScreen />;
      case "Search":
        return <SearchScreen />;
      case "Map":
        return <Map />;
      case "TargetLocation":
        return <TargetLocation data={currentScreen.params} />;
      case "Settings":
        return <SettingsScreen />;
      case "Directions":
        return <MultiStopStartEndLocation  route={currentScreen.params} />;
      default:
        return <HomeScreen />;
    }
  }

  return (
    <>
      <Map />
      {renderScreen()}
    </>
  );
};

export default MainScreen;