import React, {Component} from 'react';
import {View} from 'react-native';
import ContactUsBanner from '../Components/Contact/ContactUsBanner';
import HeaderBasic from '../Components/Headers/HeaderBasic';
import SocialIcons from '../Components/Contact/SocialIcons';
import ContactDetails from '../Components/Contact/ContactDetails';
import {HomeScreenContext} from './Home/HomeScreen';
import CustomBackHandler from './Home/RideNow/usebackbtn';

class ContactScreen extends Component {
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
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
                title="Contact Us"
                onBackPress={() => context.changeScreen('Home')}
              />
              <View
                style={{
                  position: 'relative',
                  flex: 1,
                  backgroundColor: 'white',
                  justifyContent: 'space-evenly',
                }}>
                <>
                  <ContactUsBanner />
                  <ContactDetails
                    email="hr@virtualmaze.co.in"
                    phone="9677217519"
                  />
                </>
                <SocialIcons
                  whatsappMessage="Hi, I am facing an issue with the app. Please help me out"
                  email="hr@virtualmaze.co.in"
                  phone="919677217519"
                  facebook="fb://profile/VirtualMaze"
                  colors={'#4b48ab'}
                />
              </View>
            </View>
          );
        }}
      </HomeScreenContext.Consumer>
    );
  }
}

export default ContactScreen;
