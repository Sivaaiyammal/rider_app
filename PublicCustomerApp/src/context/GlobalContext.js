import React, {createContext, useEffect, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {useColorScheme} from 'react-native';

import { DataStore } from '../controllers/DataStore';
import wsService from '../controllers/SocketServices';
import { lightTheme, darkTheme } from '../constants/theme';

export const GlobalContext = createContext();

export const ContextProvider = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(() => {
    // Initialize with device theme immediately
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  });
  const [themeMode, setThemeMode] = useState('default'); // 'light', 'dark', 'default'
  const [isInitialized, setIsInitialized] = useState(false);

  const themeOperations = useCallback((mode) => {
    let newTheme;
    let isDefault = false;
    
    switch (mode) {
      case 'dark':
        newTheme = darkTheme;
        isDefault = false;
        break;
      case 'light':
        newTheme = lightTheme;
        isDefault = false;
        break;
      case 'default':
        newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
        isDefault = true;
        break;
      default:
        newTheme = lightTheme;
        isDefault = false;
    }
    
    setTheme(newTheme);
    setThemeMode(mode);
    saveThemeSettings(mode, isDefault);
  }, [systemColorScheme]);

  const saveThemeSettings = useCallback(async (mode, isDefault) => {
    try {
      await DataStore.storeData('ThemeMode', mode);
      await DataStore.storeData('IsDefault', isDefault);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  }, []);

  const getAppTheme = useCallback(async () => {
    try {
      const savedThemeMode = await DataStore.loadData('ThemeMode');
      const isDefault = await DataStore.loadData('IsDefault');
      
      if (savedThemeMode?.data) {
        // User has explicitly set a theme
        themeOperations(savedThemeMode.data);
      } else if (isDefault?.data) {
        // User has chosen to follow system theme
        themeOperations('default');
      } else {
        // First time app launch - use current device theme
        console.log('First time launch - using device theme:', systemColorScheme);
        themeOperations('default');
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
      // Fallback to current device theme
      console.log('Fallback to device theme:', systemColorScheme);
      themeOperations('default');
    } finally {
      setIsInitialized(true);
    }
  }, [themeOperations, systemColorScheme]);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    themeOperations(newMode);
  }, [themeMode, themeOperations]);

  const resetToSystemTheme = useCallback(() => {
    themeOperations('default');
  }, [themeOperations]);

  const getCurrentDeviceTheme = useCallback(() => {
    return systemColorScheme;
  }, [systemColorScheme]);

  const addListener = useCallback(token => {
    wsService.initSocket(token);
  }, []);

  // Update theme when system color scheme changes (only if using default mode)
  useEffect(() => {
    if (themeMode === 'default' && isInitialized) {
      const newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
      setTheme(newTheme);
      console.log('System theme changed to:', systemColorScheme);
    }
  }, [systemColorScheme, themeMode, isInitialized]);

  // Initialize theme on component mount
  useEffect(() => {
    getAppTheme();
  }, [getAppTheme]);

  return (
    <GlobalContext.Provider
      value={{
        theme,
        themeMode,
        setTheme: themeOperations,
        toggleTheme,
        resetToSystemTheme,
        getCurrentDeviceTheme,
        addListener,
        isDarkMode: themeMode === 'dark' || (themeMode === 'default' && systemColorScheme === 'dark'),
        systemColorScheme,
        isInitialized
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;

ContextProvider.propTypes = {
    children: PropTypes.any.isRequired,
};
