import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useStackScreenStore } from '../store/useStackScreenStore';

export const useCustomBackHandler = () => {
  const { goBack, stackScreen } = useStackScreenStore();

  useEffect(() => {
    const onBackPress = () => {
      if (stackScreen.length > 1) {
        goBack();
        return true; // handled
      }
      return false; // let OS handle (e.g., exit app)
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [stackScreen, goBack]);
}; 