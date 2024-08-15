import { View, Text } from "react-native";
import React, { createContext, useEffect, useState, useCallback } from "react";
import { DataStore } from "../Constants/DataStore";
import { showNotification } from "../Components/NotificationManager";
import { DistanceFormate } from "../Utils/DistanceFormate";

export const GlobalContext = createContext();

export const ContextProvider = ({ children }) => {
  const [savedAddress, setSavedAddress] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);

  const [distanceConfig, setDistanceConfig] = useState(DistanceFormate.km);

  // Save Address
  const saveAddress = useCallback(
    async (value) => {
      try {
        const newData = [...savedAddress, value];
        console.log("Saving address:", newData);
        setSavedAddress(newData);
        await DataStore.storeData("savedAddressed", newData);
        showNotification("Address Saved Successfully", "", "success");
      } catch (error) {
        console.error("Error saving address:", error);
        showNotification("Something Went Wrong", "Please try again", "success");
      }
    },
    [savedAddress]
  );

  //Get Saved Address
  const getSavedAddress = useCallback(async () => {
    try {
      const address = await DataStore.loadData("savedAddressed");
      console.log("Loaded addresses:", address.data);
      if (address?.data) {
        setSavedAddress(address.data);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  }, []);

  // Save Route
  const saveRoute = useCallback(async (value) => {
    console.log("hari-->>saveRoute-->>", value);
  }, []);

  //Get Saved Route
  const getSavedRoute = useCallback(async () => {}, []);

  // get distance formate
  const getDistanceUnit = async () => {
    setIsLoading(true);
    try {
      const unitType = await DataStore.loadData('unitType');
      setDistanceConfig(DistanceFormate[unitType?.data] || DistanceFormate.km);
    } catch (error) {
      console.error('Error getting distance unit:', error);
      setIsLoading(false);
    }
  };
 
  // update distance formate
  const updateDistanceUnit = async unitType => {
    setIsLoading(true);
    try {
      await DataStore.storeData('unitType', unitType);
      setDistanceConfig(DistanceFormate[unitType] || DistanceFormate.km);
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting distance unit:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSavedAddress();
    getDistanceUnit();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        saveAddress,
        saveRoute,
        getSavedRoute,
        updateDistanceUnit,
        savedAddress,
        savedRoutes,
        distanceConfig,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
