import messaging from '@react-native-firebase/messaging';

class PushNotificationHandler {
    constructor(events) {
        this.events = events
    }

    init() {
        messaging().onMessage(async remoteMessage => {
            console.log(remoteMessage,"NOTIFICATION")
            const currentTime = Date.now();
            const sentTime = remoteMessage.sentTime;
            const messageTTL = remoteMessage.ttl * 1000; // Convert to milliseconds

            if (currentTime - sentTime < messageTTL) {
                let { data } = remoteMessage
                this.events[data.name] ? this.events[data.name]() : null
            }

        });
    }
}

export default PushNotificationHandler