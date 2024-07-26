import {create} from 'zustand';

export const useStackScreenStore = create((set, get) => {
  const initialScreen = {screen: 'Home', params: {}};

  return {
    stackScreen: [initialScreen],
    setStackScreen: (screen, params = {}) => {
      const stack = get().stackScreen;
      if (stack.length > 0 && stack[stack.length - 1].screen === screen) {
        set({ stackScreen: [...stack.slice(0, -1), { screen, params }] });
      } else {
        set({ stackScreen: [...stack, { screen, params }] });
      }
    },
    goBack: () => {
      const stack = get().stackScreen;
      console.log(stack);
      if (stack.length > 1) {
        set({ stackScreen: stack.slice(0, -1) });
      }
    },
  };
});
