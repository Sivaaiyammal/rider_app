/* eslint-disable class-methods-use-this */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-console */

import { NativeModules } from "react-native";

const { PlayTripSoundModule } = NativeModules;

class TripAlert {
  constructor() {
  }

  playAlertSound() {
    console.log('Playing alert sound using native method');
    return PlayTripSoundModule.playAlertSound();
  }

  playDriverAllocatedAlert() {
   
    return PlayTripSoundModule.playSound('driver_allocated', false);
  }

  stopAlertSound() {
    return PlayTripSoundModule.stopAlertSound();
  }
}

const tripAlert = new TripAlert();
export default tripAlert;

