import {create} from 'zustand';

const useCurrentScreenStore = create(set => ({
  currentScreen: 'Drive',
  prevScreen: 'Drive',
  showBottomTabs:true,
  setShowBottomTabs:bool => set({ showBottomTabs:bool}),
  setCurrentScreen: currentScreen => {
    set(state => ({ prevScreen: state.currentScreen, currentScreen }));
  },
  reset: () => {
    set({currentScreen: 'Drive', prevScreen: 'Drive'});
  }
}));

export default useCurrentScreenStore;
