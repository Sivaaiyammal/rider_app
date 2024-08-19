import { View, Text } from "react-native";
import React, { createContext, useEffect, useState, useCallback } from "react";
import { DataStore } from "../Constants/DataStore";
import { showNotification } from "../Components/NotificationManager";
import { DistanceFormate } from "../Utils/DistanceFormate";
import { useSettingsPropsStore } from "../Store/useSettingsPropsStore";

export const GlobalContext = createContext();

export const ContextProvider = ({ children }) => {
  const [savedAddress, setSavedAddress] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [isLoading, setIsLoading] =useState(false)

  const {settings, initializeSettings } = useSettingsPropsStore();

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

  useEffect(() => {
    const initialize = async () => {
      await getSavedAddress();
      await initializeSettings();
    };
  
    initialize();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        saveAddress,
        saveRoute,
        getSavedRoute,
        savedAddress,
        savedRoutes,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
