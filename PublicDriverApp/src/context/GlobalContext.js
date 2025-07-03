import {useColorScheme} from 'react-native';
import React, {createContext, useEffect, useState, useCallback} from 'react';
import PropTypes from 'prop-types';

import { DataStore } from '../controllers/DataStore';

export const GlobalContext = createContext();

export const ContextProvider = ({children}) => {
  const [themeValue, setThemeValue] = useState('');
  const themes = useColorScheme();

  const themeOperations = useCallback(theme => {
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
  }, [themes]);

  const getAppTheme = useCallback(async () => {
    const theme = await DataStore.loadData('Theme');
    const isDefault = await DataStore.loadData('IsDefault');
    isDefault.data ? themeOperations('default') : themeOperations(theme.data);
    setThemeValue(theme.data);
  }, [themeOperations]);

  const setTheme = useCallback(async (theme, isDefault) => {
    DataStore.storeData('Theme', theme);
    DataStore.storeData('IsDefault', isDefault);
    setThemeValue(theme);
  }, []);

  useEffect(() => {
    getAppTheme();
  }, [getAppTheme]);

  return (
    <GlobalContext.Provider
      value={{
        setTheme,
        themeOperations,
        themeValue,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;

ContextProvider.propTypes = {
    children: PropTypes.any.isRequired,
};
