import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // You can use any other icon library you prefer
import {Linking} from 'react-native';

// styles

import {SocialStyles, contactStyles} from '../../Styles/Contact/Social';

class SocialIcons extends Component {
  openWhatsApp = async (phoneNumber, message) => {
    console.log('openWhatsApp', phoneNumber, message);
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;
    const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(
      message,
    )}`;
    const storeURL =
      'https://play.google.com/store/apps/details?id=com.whatsapp';

    console.log(url);

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(storeURL);
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  makePhoneCall = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.error('Failed to open phone dialer:', err);
    });
  };

  sendEmail = () => {
    const email = this.props.email;
    const subject = 'Need Help';
    const body = 'This is the body of the email';

    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailto);
  };

  openFacebook = async () => {
    // const url = this.props.facebook; // Replace with your Facebook ID
    // try {
    //   const canOpen = await Linking.canOpenURL(url);
    //   if (canOpen) {
    //     await Linking.openURL(url);
    //   } else {
    //     await Linking.openURL(this.props.facebook); // Replace with your Facebook username or page
    //   }
    // } catch (error) {
    //   console.error('An error occurred', error);
    // }
    const userId = 'VirtualMaze';
    const fbProfileUrl = `fb://profile/${userId}`;

    await Linking.canOpenURL(fbProfileUrl).then(supported => {
      if (supported) {
        Linking.openURL(fbProfileUrl);
      } else {
        // Fallback to opening in a web browser
        const webProfileUrl = `https://www.facebook.com/profile.php?id=${userId}`;
        Linking.openURL(webProfileUrl);
      }
    });
  };

  render() {
    return (
      <View style={SocialStyles.container}>
        <TouchableOpacity
          onPress={() =>
            this.openWhatsApp(this.props.phone, this.props.whatsappMessage)
          }
          style={[SocialStyles.iconButton, {backgroundColor: 'green'}]}>
          <Icon name="whatsapp" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.makePhoneCall(this.props.phone);
          }}
          style={{
            ...SocialStyles.iconButton,
            backgroundColor: this.props.colors ? this.props.colors : '#2785ff',
          }}>
          <Icon name="phone" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.sendEmail();
          }}
          style={{
            ...SocialStyles.iconButton,
            backgroundColor: this.props.colors ? this.props.colors : '#2785ff',
          }}>
          <Icon name="envelope" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.openFacebook();
          }}
          style={{
            ...SocialStyles.iconButton,
            backgroundColor: this.props.colors ? this.props.colors : '#2785ff',
          }}>
          <Icon name="facebook" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
}

export default SocialIcons;
