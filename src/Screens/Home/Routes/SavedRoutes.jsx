import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { Colors, Fonts } from "../../../Constants/Contants";
import NavBar from "../../../Components/NavBar";
import { useStackScreenStore } from "../../../Store/useStackScreen";
import GlobalContext from "../../../Context/GlobalContext";
import useMapStore from "../../../Store/useMapStore";
import useLocationStore from "../../../Store/useLocationStore";
import NoDataFound from "../../../Components/NoDataFound";

const SavedRoutes = () => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const { setDirectionPoints, setMapMarkers } = useMapStore();
  const { setDirections } = useLocationStore();

  const { savedRoutes } = useContext(GlobalContext);

  const onBackPress = () => {
    goBack();
  };

  console.log("hari-->>savedRoputes->>", savedRoutes);

  const goToRoutes = (item) => {
    const directionPoints = item.locations
      .filter((direction) => direction.location.length > 0)
      .map((direction) => ({
        lat: direction.location[1],
        lon: direction.location[0],
      }));
    setMapMarkers([]);
    console.log("directionPoints-route", directionPoints, item.locations);
    setDirections(item.locations);
    setDirectionPoints({ locations: directionPoints, type: "car" });
    setStackScreen("Directions", "position");
  };

  return (
    <View style={styles.screenContainer}>
      <NavBar onBackPress={() => onBackPress()} title={"saved_routes"} withBg />
      <View style={styles.contianer}>
        {savedRoutes.length === 0 ? (
          <NoDataFound message={"No Routes Found"} />
        ) : (
          savedRoutes?.map((item) => {
            return (
              <TouchableOpacity
                style={styles.routesCard}
                onPress={() => goToRoutes(item)}
              >
                <Text style={{ fontFamily: Fonts.regular, color:Colors.black }}>
                  <Text style={{ fontFamily: Fonts.medium,color:Colors.black  }}>Route Name: </Text>
                  {item.routeName}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};

export default SavedRoutes;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contianer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  routesCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: Colors.grey_xxlight,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
