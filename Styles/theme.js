// Desc: Global theme for the app
import { Appearance } from 'react-native';

let globalTheme = Appearance.getColorScheme();

/** Function to set the global theme
 * @param {string} theme - Theme name (light/dark)
 */
export function setGlobalTheme(theme) {
  globalTheme = theme;
  console.log("Color Scheme changed to ", theme);
}

// Function to get the global theme
export function getGlobalTheme() {
  return globalTheme;
}
