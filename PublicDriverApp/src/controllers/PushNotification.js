/* eslint-disable class-methods-use-this */
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { useStackScreenStore } from '../store/useStackScreenStore';

class PushNotifications {
  constructor() {
    this.onNotificationHandler = this.onNotificationHandler.bind(this);

    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: this.onNotificationHandler,
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios' && true,
    });

    PushNotification.createChannel(
      {
        channelId: 'DriverApp',
        channelName: 'Driver Notifications',
        channelDescription: 'A channel to categorise driver notifications',
        playSound: false,
        soundName: 'default',
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`),
    );
  }

  async notificationEvents (notification) {
    const { setStackScreen } = useStackScreenStore.getState();
    if (notification.title === 'New Trip Request') {
      console.log('New Trip Request.....................................................')
      setStackScreen('TripDetailsScreen')
    }
  }

  scheduleNotification() {
    console.log('scheduleNotification')
    
    PushNotification.localNotification({
      channelId: 'DriverApp',
      title: 'New Trip Request',
      message: 'You have a new trip request',
      details: {
        tripId: '67e38154ad833de5f7426985'
      },
      date: new Date(Date.now() + 1000 * 20), // 20 seconds from now
    });
  }

  onRemoteNotificationHandler(notification) {
    console.log(notification,'notification')
     if(notification) {
      this.notificationEvents(notification)
     }
  }

  onNotificationHandler(notification) {
    if (notification.userInteraction) {
      this.notificationEvents(notification)
    }
  }

  sendNotification(fileName, title, details = {}) {
    PushNotification.localNotification({
      channelId: 'DriverApp',
      title: title,
      message: fileName,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      details: details
    });
  }
}

export default new PushNotifications(); 