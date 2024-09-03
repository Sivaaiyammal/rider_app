import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import HeaderBasic from '../Components/Headers/HeaderBasic';
import {HomeScreenContext} from './Home/HomeScreen';
import NotificationList from '../Components/Notification/NotificationList';
import notification_driver from '../Assets/Notification/notification_driver.png';
import CustomBackHandler from './Home/RideNow/usebackbtn';

class NotificationScreen extends Component {
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
    this.state = {
      notificationsData: {
        Today: [
          {
            id: '1',
            title: 'You have upcoming rides scheduled on 01 Jan 2023',
            subtitle: '',
            read: false,
            createdDate: '2023-11-10T08:00:00Z',
            image: notification_driver,
          },
          {
            id: '2',
            title: 'Your driver has reached your location',
            subtitle: '',
            read: true,
            createdDate: '2023-11-10T08:00:00Z',
            image: notification_driver,
          },
        ],
        Yesterday: [
          {
            id: '4',
            title: 'Your driver has reached your location',
            subtitle: '',
            read: true,
            createdDate: '2023-11-09T08:00:00Z',
            image: notification_driver,
          },
        ],
      },
    };
  }

  handleDeviceBackPress(context) {
    context.changeScreen('Home');
  }

  render() {
    return (
      <HomeScreenContext.Consumer>
        {context => {
          return (
            <View
              style={{position: 'relative', flex: 1, backgroundColor: 'white'}}>
              <CustomBackHandler
                onBackPress={() => this.handleDeviceBackPress(context)}
              />
              <HeaderBasic
                title="Notification"
                onBackPress={() => context.changeScreen('Home')}
                disableRigthIcon={true}
              />
              <View style={styles.rowByTwo}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.notificationTextsmall}>You Have</Text>
                  <Text
                    style={[styles.notificationTextsmall, {color: '#4b48ab'}]}>
                    {' '}
                    3 unread Notification
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text
                    style={[styles.notificationTextsmall, {color: '#0066ff'}]}>
                    Mark all Read
                  </Text>
                </TouchableOpacity>
              </View>
              <NotificationList itemData={this.state.notificationsData} />
            </View>
          );
        }}
      </HomeScreenContext.Consumer>
    );
  }
}

export default NotificationScreen;
const styles = StyleSheet.create({
  rowByTwo: {
    width: '94%',
    paddingVertical: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  notificationTextsmall: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
  },
});
