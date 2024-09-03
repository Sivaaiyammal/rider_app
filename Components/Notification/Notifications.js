import React from 'react';
import PropTypes from 'prop-types';

import Notification from './Notification';

class Notifications extends React.Component {
  onHandleRemove = (notification) => () => {
    const { handleRemove } = this.props;
    if (handleRemove) {
      handleRemove(notification);
    }
  }

  render() {
    const { notifications, handleRemove } = this.props;

    return (
        notifications.map(notification => (
          <Notification
            key={notification.id}
            variant={notification.type}
            message={notification.message}
            timeOut={notification.timeOut}
            position={notification.position}
            onHandleRemove={this.onHandleRemove(notification)}
          />
        ))
    );
  }
}

Notifications.propTypes = {
  notifications: PropTypes.array.isRequired,
  handleRemove: PropTypes.func.isRequired
};

export default Notifications;
