/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import './src/shim';
import App from './App';
import {name as appName} from './app.json';

// Removed early user stats prefetch; will run after login

AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
