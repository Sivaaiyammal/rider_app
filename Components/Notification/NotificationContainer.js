import React from 'react';

import Notifications from './Notifications';
import NotificationManager from './NotificationManager';

class NotificationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }

  componentDidMount() {
    NotificationManager.addNotificationChangeListener(this.handleStoreChange);
  }

  componentWillUnmount() {
    NotificationManager.removeNotificationChangeListener(this.handleStoreChange);
  }

  handleStoreChange = (notifications) => {
    this.setState({
      notifications
    });
  };

  handleRemove = (notification) => {
    
    NotificationManager.removeNotification(notification);
  }

  render() {
    const { notifications } = this.state;

    if(!notifications.length) {
      return null;
    }

    return (
      <Notifications
        notifications={notifications}
        handleRemove={this.handleRemove}
      />
    );
  }
}

export default NotificationContainer;
