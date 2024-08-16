import React from "react";

import { useStackScreenStore } from "../Store/useStackScreen";

import Map from "./Map";
import SearchScreen from "./Home/SearchScreen";
import HomeScreen from "./Home/HomeScreen";
import SettingsScreen from "./Settings/SettingsScreen";
import TargetLocation from "./Home/targetLocation";
import MultiStopStartEndLocation from "./Home/Routes/MultiStopStartEndLocation";
import POIresultScreen from "./POIScreens/POIresultScreen";
import SavedRoutes from "./Home/Routes/SavedRoutes";
import RouteSettings from "./Settings/RouteSettings";
import MyLocations from "./Settings/MyLocations";
import LanguageScreen from "./Settings/LanguageScreen";

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
        return <SearchScreen data={currentScreen.params}/>;
      case "Map":
        return <Map />;
      case "TargetLocation":
        return <TargetLocation data={currentScreen.params} />;
      case "Settings":
        return <SettingsScreen />;
      case "Directions":
        return <MultiStopStartEndLocation  route={currentScreen.params} />;
      case "POIresult":
        return <POIresultScreen />;
      case "savedRoutes":
        return <SavedRoutes />;
        case "RouteSettings":
        return <RouteSettings />;
        case "MyLocations":
          return <MyLocations />;
          case "Languages":
          return <LanguageScreen />;
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