import {useColorScheme} from 'react-native';
import React, {createContext, useEffect, useState, useCallback} from 'react';
import PropTypes from 'prop-types';

import { DataStore } from '../controllers/DataStore';
import wsService from '../controllers/SocketServices';
export const GlobalContext = createContext();

export const ContextProvider = ({children}) => {
  const [themeValue, setThemeValue] = useState('');
  const themes = useColorScheme();

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
  }, []);

  const setTheme = useCallback(async (theme, isDefault) => {
    DataStore.storeData('Theme', theme);
    DataStore.storeData('IsDefault', isDefault);
    setThemeValue(theme);
  }, []);

  const addListener = useCallback(token => {
    wsService.initSocket(token);
  }, []);


  useEffect(() => {
    const initialize = async () => {
      await getAppTheme();
    };

    initialize();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        setTheme,
        themeOperations,
        themeValue,
        addListener
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;

ContextProvider.propTypes = {
    children: PropTypes.any.isRequired,
};
