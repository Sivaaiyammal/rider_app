import {create} from 'zustand';

export const useStackScreenStore = create((set, get) => ({
  stackScreen: [{ name: 'Home', params: null }],
  
  setStackScreen: (screenName, params = null) => {
    const newStack = [...get().stackScreen, { name: screenName, params }];
    set({stackScreen: newStack});
  },


  getCurrentScreenName: () => {
    const stack = get().stackScreen;
    return stack[stack.length - 1].name;
  },
  
  goBack: () => {
    const stack = get().stackScreen;
    if(stack.length > 1){
      const arr = stack.slice(0, -1);
      set({stackScreen: arr});
    }
    else{
      set({stackScreen: [{ name: 'Home', params: null }]});
    }
  },
  
  reset: () => {
    set({stackScreen: [{ name: 'Home', params: null }]});
  },

  getCurrentScreen: () => {
    const stack = get().stackScreen;
    return stack[stack.length - 1];
  }
}));