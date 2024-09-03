/* eslint-disable no-bitwise */
import { EventEmitter } from 'events';
import { utils } from '../../Controllers/utils';

const Constants = {
  CHANGE: 'change',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

class NotificationManager extends EventEmitter {
  constructor() {
    super();
    this.listNotifications = [];
  }

  createNotification(notification) {
    const defaultNotify = {
      id: utils.createUUID(),
      type: notification.type ? notification.type : 'info',
      message: notification.message,
      timeOut: notification.timeOut ? notification.timeOut : 5000,
      position: notification.position ? notification.position : {
        horizontal: 'left',
        vertical: 'bottom',
      }
    };

    if (this.listNotifications.length > 0) { // Remove previous notifications.
      this.removeNotificationExcept(defaultNotify);
      return;
    }

    this.listNotifications.push(defaultNotify);
    this.emitChange();
  }

  info(message, timeOut = 5000, position) {
    this.createNotification({
      type: Constants.INFO,
      message,
      timeOut,
      position
    });
  }

  warning(message, timeOut = 5000, position) {
    this.createNotification({
      type: Constants.WARNING,
      message,
      timeOut,
      position
    });
  }

  success(message, timeOut = 5000, position) {
    this.createNotification({
      type: Constants.SUCCESS,
      message,
      timeOut,
      position
    });
  }

  error(message, timeOut = 5000, position) {
    this.createNotification({
      type: Constants.ERROR,
      message,
      timeOut,
      position
    });
  }

  removeNotification(notification) {
    this.listNotifications = this.listNotifications.filter(n => notification.id !== n.id);
    this.emitChange();
  }

  removeNotificationExcept(notification) {
    this.listNotifications = [notification];
    this.emitChange();
  }

  removeAllNotification() {
    this.listNotifications = [];
    this.emitChange();
  }

  emitChange() {
    this.emit(Constants.CHANGE, this.listNotifications);
  }

  addNotificationChangeListener(callback) {
    this.addListener(Constants.CHANGE, callback);
  }

  removeNotificationChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}

export default new NotificationManager();
