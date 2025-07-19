import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";

import  useRideBookingInfo  from "../../store/useRideBookingInfo";
import { Fonts } from "../../../../constants/constants";
import FemaleDriverIcon from "../../../../assets/icons/femaleDriverOnlyIcon.svg"
import NightDriveIcon from "../../../../assets/icons/nightDriveIcon.svg"
import CustomSwitch from "../../../../components/Common/SwitchInput"

const RidePreference = () => {
  const {femaleDriverOnly,setFemaleDriverOnly,safeNightRides,setSafeNightRides} = useRideBookingInfo()

  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <FemaleDriverIcon width={28} height={28} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Female Drivers Only</Text>
          <Text style={styles.subtitle}>
            Get verified female drivers for your comfort and peace of mind
          </Text>
        </View>
        <CustomSwitch
          value={femaleDriverOnly}
          onValueChange={()=>setFemaleDriverOnly(!femaleDriverOnly)}
          trackColor={{ false: "#d1d5db", true: "#003988" }}
          thumbColor="#fff"
        />
      </View>
      <View style={styles.card}>
        <View style={[styles.iconContainer, {backgroundColor:"#E6FFF2"}]}>
          <NightDriveIcon width={28} height={28} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Safe Night Rides <Text style={styles.timeLabel}>(12 AM - 4 AM)</Text>
          </Text>
          <Text style={styles.subtitle}>
            Ride safely at night with our top-rated, most trusted drivers
          </Text>
        </View>
        <CustomSwitch
          value={safeNightRides}
          onValueChange={()=>setSafeNightRides(!safeNightRides)}
          trackColor={{ false: "#d1d5db", true: "#003988" }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 16,
    paddingBottom:70
  },
  iconContainer: {
    padding:15,
    borderRadius: 22,
    backgroundColor: "#FFD6F6",
    alignItems: "center",       
    justifyContent: "center",
    marginRight: 16,    
  },
  
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal:10,
    marginBottom: 0,
    gap:10,
   
  },
  iconCirclePink: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFD6F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6FFF2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    fontFamily:Fonts.regular
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
    fontFamily:Fonts.medium
  },
  timeLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "400",
    fontFamily:Fonts.regular
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
    marginTop: 2,
    fontFamily:Fonts.regular
  },
});

export default RidePreference;
