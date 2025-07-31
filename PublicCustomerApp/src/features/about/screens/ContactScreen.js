import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import NavBar from '../../../components/NavBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../constants/constants';
import ContactPageImage from '../../../assets/image/common/contactPageImage.svg';
import { useStackScreenStore } from '../../../store/useStackScreenStore';

const ContactScreen = () => {
  const {goBack} = useStackScreenStore();
  
  const contactData = {
    logo: require('../../../assets/image/common/contactPageImage.svg'),
    phone: '+1 234 567 8900',
    email: 'hr@virtualmaze.com',
    socialLinks: {
      whatsapp: 'whatsapp://send?phone=1234567890',
      phone: 'tel:+1234567890',
      email: 'mailto:hr@virtualmaze.com',
      facebook: 'https://www.facebook.com/VirtualMaze/'
    }
  };

  const HandleBackBtn = () => {
    goBack();
  };

  const openLink = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  return (
    <>
      <NavBar withBg={true} onBackPress={HandleBackBtn} title={'Contact Us'} />
      <View style={styles.container}>
        
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <ContactPageImage />
        </View>

        {/* Contact Info Section */}
        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={30} color={colors.violet} />
            <View>
              <Text style={styles.infoTextHeading}>Call Us</Text>
              <Text style={styles.infoText}>{contactData.phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={30} color={colors.violet} />
            <View>
              <Text style={styles.infoTextHeading}>Email Us</Text>
              <Text style={styles.infoText}>{contactData.email}</Text>
            </View>
            
          </View>
        </View>

        {/* Social Links Section */}
        <View style={styles.socialLinks}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openLink(contactData.socialLinks.whatsapp)}
          >
            <Ionicons name="logo-whatsapp" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openLink(contactData.socialLinks.phone)}
          >
            <Ionicons name="call" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openLink(contactData.socialLinks.email)}
          >
            <Ionicons name="mail" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openLink(contactData.socialLinks.facebook)}
          >
            <Ionicons name="logo-facebook" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 200,
    height: 100,
  },
  contactInfo: {
    marginVertical: 30,
  },
  infoTextHeading: {
    marginLeft: 15,
    fontSize: 16,
    color: colors.black,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  infoText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 40,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContactScreen;
