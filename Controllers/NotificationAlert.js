import notifee, {
  AuthorizationStatus,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';

class NotificationAlert {
  constructor() {

    // this.details = NotificationData

    notifee.createChannel({
      id: 'customer',
      name: 'Status For Booked Ride',
      lights: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    notifee.registerForegroundService(notification => {
      return new Promise(() => {
        this.scheduleNotification();
        console.log(notification);
      });
    });

    notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          this.scheduleNotification();
          break;
        case EventType.PRESS:
          console.log('Notification clicked by user', detail.notification);
          break;
      }
    });

    notifee.onBackgroundEvent(async ({type, detail, headless}) => {
      if (type === EventType.DISMISSED) {
        // this.scheduleNotification();
        console.log('hari-->>onBackgroundEvent-->>', type, detail, headless);
      }
    });
  }

  async checkPermissions() {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log('Permission settings:', settings);
      return true;
    } else {
      console.log('User declined permissions');
      return false;
    }
  }

  async scheduleNotification() {
    try {
      await notifee.displayNotification({
        title: 'title',
        body: `is on the way`,
        android: {
          channelId: 'customer',
          ongoing: true,
          autoCancel: false,
          showTimestamp: true,
          // pressAction: {
          //   id: 'default',
          // },
          progress: {
            max: 10,
            current: 5,
          },
        },
      });
    } catch (e) {
      console.log('e------>>', e);
    }
  }

  async cancelNotification() {
    await notifee.cancelNotification('1');
  }
}

export default new NotificationAlert();
