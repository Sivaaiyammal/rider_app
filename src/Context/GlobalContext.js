import { View, Text, useColorScheme } from "react-native";
import React, { createContext, useEffect, useState, useCallback } from "react";
import { DataStore } from "../Constants/DataStore";
import { showNotification } from "../Components/NotificationManager";
import { DistanceFormate } from "../Utils/DistanceFormate";
import { useSettingsPropsStore } from "../Store/useSettingsPropsStore";
import useMapStore from "../Store/useMapStore";

export const GlobalContext = createContext();

export const ContextProvider = ({ children }) => {
  const [savedAddress, setSavedAddress] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [isLoading, setIsLoading] =useState(false)

  const [themeValue, setThemeValue] = useState('');
  const [initialValue, setInitialValue] = useState(0);
  const themes = useColorScheme();

  const { initializeSettings } = useSettingsPropsStore();
  const {setMode} = useMapStore()

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

  const themeOperations = theme => {
    switch (theme) {
      case 'dark':
        setTheme(theme, false);
        return;
      case 'light':
        setTheme(theme, false);
        return;
      case 'default':
        setTheme(themes, true);
        return;
    }
  };

  const getAppTheme = useCallback(async () => {
    const theme = await DataStore.loadData('Theme');
    const isDefault = await DataStore.loadData('IsDefault');
    isDefault.data ? themeOperations('default') : themeOperations(theme.data);
    setThemeValue(theme.data);
    setMode(theme.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback(async (theme, isDefault) => {
    DataStore.storeData('Theme', theme);
    DataStore.storeData('IsDefault', isDefault);
    setThemeValue(theme);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await getSavedAddress();
      await initializeSettings();
      await getAppTheme();
    };
  
    initialize();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        saveAddress,
        saveRoute,
        getSavedRoute,
        setTheme,
        themeOperations,
        savedAddress,
        savedRoutes,
        themeValue,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
