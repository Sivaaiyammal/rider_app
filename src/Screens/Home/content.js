import { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";

import { useStackScreenStore } from "../../Store/useStackScreen";
import SearchInput from "./searchInput";
import TargetLocation from "./targetLocation";
import POIScreen from "./POIScreen";
import SearchScreen from "./SearchScreen";
import GlobalContext from "../../Context/GlobalContext";
import Colors from "../../Constants/Theme/Colors";

const ContentScreen = ({ setDragHeight }) => {
  const { setStackScreen } = useStackScreenStore();
  const [targetLocation, setTargetLocation] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("Home");

  const { themeValue } = useContext(GlobalContext);
  const styles = styling(themeValue);

  const handleCurrentScreen = (screen, data) => {
    if (screen === "TargetLocation") {
      setCurrentScreen(screen);

      setTargetLocation(data);
    } else if (screen === "Search") {
      setStackScreen(screen);
    } else {
      setCurrentScreen(screen);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {currentScreen !== "TargetLocation" && (
        <SearchInput
          searchText={""}
          setCurrentScreen={handleCurrentScreen}
          focused={true}
          closeBtn={false}
        />
      )}
      {currentScreen === "Home" && <POIScreen />}
    </View>
  );
};

export default ContentScreen;

const styling = (theme) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      justifyContent: "center",
      // backgroundColor: Colors[theme]?.themeColor,
      backgroundColor: 'white',
    },
  });
