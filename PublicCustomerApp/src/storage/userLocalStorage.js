import AsyncStorage from '@react-native-async-storage/async-storage';

async function setLocation(type, location) {
  await AsyncStorage.setItem(`@location_${type}`, JSON.stringify(location));
}

async function getLocation(type) {
  const val = await AsyncStorage.getItem(`@location_${type}`);
  return val ? JSON.parse(val) : null;
}

export { setLocation, getLocation };