import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, Fonts } from '../../../../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useUserInfoStore from '../../../../store/useUserInfoStore';
import useRideBookingInfo from '../../store/useRideBookingInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { height } from '../../../../utils/Utils';
import AdaptiveText from '../../../../components/Common/AdaptiveText';

const Contactsheet = ({ onConfirm }) => {
  const { t } = useTranslation();
  const { userdetails } = useUserInfoStore();
  const { rideBookMode, setPassangerDetails, setRideBookMode,passangerDetails } = useRideBookingInfo();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [contactDetails, setContactDetails] = useState([]);
  

  // Load contacts from local storage on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Update selected contact when rideBookMode changes
  useEffect(() => {
    if (rideBookMode === 'MYSELF' && userdetails) {
      setPassangerDetails({
        name: userdetails.name,
        phone: userdetails.phone
      });
    } 
  }, [rideBookMode, userdetails]);

  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('savedContacts');
      if (savedContacts) {
        setContactDetails(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const saveContacts = async (contacts) => {
    try {
      await AsyncStorage.setItem('savedContacts', JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const isFormValid = () => {
    return newContact.name.trim() !== '' && validatePhoneNumber(newContact.phone);
  };

  const handleAddContact = () => {
    if (!isFormValid()) {
      Alert.alert(t('invalid_input'), t('invalid_mobile_number'));
      return;
    }

    const alreadyExists = contactDetails.some(c => c.phone === newContact.phone);
    if (alreadyExists) {
      Alert.alert(t('contact_exists'), t('contact_already_exists'));
      return;
    }

    const updatedContacts = [...contactDetails, newContact];
    setContactDetails(updatedContacts);
    saveContacts(updatedContacts);
    setNewContact({ name: '', phone: '' });
    setShowAddContact(false);
  };

  const handleSelectContact = (contact) => {
   
    setPassangerDetails(contact);
    setRideBookMode('OTHERS');
    onConfirm();
  };

  const handleSelectMyself = () => {
    if (!userdetails?.name || !userdetails?.phone) {
      Alert.alert(t('user_details'), t('user_details_not_available'));
      return;
    }

    const contact = {
      name: userdetails.name,
      phone: userdetails.phone
    };

    setPassangerDetails(contact);
    setRideBookMode('MYSELF');
    onConfirm();
  };

  const handleDeleteContact = (contactToDelete) => {
    Alert.alert(
      t('delete_contact'),
      `${t('delete_contact_confirm')} ${contactToDelete.name}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contactDetails.filter(c => c.phone !== contactToDelete.phone);
            setContactDetails(updatedContacts);
            saveContacts(updatedContacts);
            
            // If the deleted contact was selected, clear the selection
            if (passangerDetails?.phone === contactToDelete.phone) {
              setPassangerDetails(null);
              setRideBookMode('MYSELF');
            }
          }
        }
      ]
    );
  };

  // Check if "Myself" is selected
  const isMyselfSelected = rideBookMode === 'MYSELF' && userdetails && 
    passangerDetails?.phone === userdetails.phone;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AdaptiveText style={styles.title}>{t('book_for')}</AdaptiveText>
      </View>
      <ScrollView style={{maxHeight:height*0.6}} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.myselfButton}
        onPress={handleSelectMyself}
      >
        <View style={styles.contactImageContainer}> 
            <Ionicons name="person" size={24} color={colors.black} />
          </View>
        <View style={styles.myselfInfo}>
          <AdaptiveText style={styles.myselfText}>{t('myself')}</AdaptiveText>
          {userdetails && (
            <AdaptiveText style={styles.myselfDetails}>
              {userdetails.name} - {userdetails.phone}
            </AdaptiveText>
          )}
        </View>
        {isMyselfSelected && <Ionicons name="checkmark-circle" size={24} color={colors.black} />}
      </TouchableOpacity>
      {contactDetails.length > 0 && <View style={styles.divider} />}

      {contactDetails.map((contact, index) => (
        <>
        {index !== 0 && <View style={styles.divider} />}
        <TouchableOpacity 
          key={index}
          style={styles.contactItem}
          onPress={() => handleSelectContact(contact)}
        >
          <View style={styles.contactImageContainer}> 
            <Ionicons name="person" size={24} color={colors.black} />
          </View>
          <View style={styles.contactInfo}>
            <AdaptiveText numberOfLines={1} style={styles.contactName} ellipsizeMode="tail">{contact.name}</AdaptiveText>
            <AdaptiveText style={styles.contactPhone}>{contact.phone}</AdaptiveText>
          </View>
          <View style={styles.contactActions}>
            {passangerDetails?.phone === contact.phone && rideBookMode === 'OTHERS' && (
              <Ionicons name="checkmark-circle-sharp" size={30} color={colors.black} />
            )}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteContact(contact)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.red} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </>
      ))}
      </ScrollView>
      {!showAddContact ? (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddContact(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.black} />
          <AdaptiveText style={styles.addButtonText}>{t('add_new_contact')}</AdaptiveText>
        </TouchableOpacity>
      ) : (
        <View style={styles.addContactForm}>
          <TextInput
            style={styles.input}
            placeholder={t('enter_name')}
            placeholderTextColor="grey"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
          />
          <View style={[styles.input, {flexDirection:'row',gap:10}]}>
            <Text style={{fontFamily:Fonts.medium,fontSize:16,color:colors.black}}>+91</Text>
            <TextInput
              style={{flex: 1}}
              placeholder={t('enter_mobile_number')}
              placeholderTextColor="grey"
              keyboardType="phone-pad"
              value={newContact.phone}
              maxLength={10}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                !isFormValid() && styles.disabledButton
              ]}
              disabled={!isFormValid()}
              onPress={handleAddContact}
            >
              <AdaptiveText style={styles.confirmText}>{t('add_contact')}</AdaptiveText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setNewContact({ name: '', phone: '' });
                setShowAddContact(false);
              }}
            >
              <Ionicons name="close" style={{ color: colors.grey_dark }} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
    </View>
  );
};

Contactsheet.propTypes = {
  onConfirm: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: colors.black
  },
  myselfButton: {
    paddingVertical:15,
    gap:15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  myselfInfo: {
    flex: 1
  },
  myselfText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black
  },
  myselfDetails: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_dark,
    marginTop: 4
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical:15,
    gap:15
  },
  contactImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey_light,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contactInfo: {
    flex: 1
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  contactName: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black
  },
  contactPhone: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_dark,
    marginTop: 4
  },
  deleteButton: {
    padding: 5
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
    backgroundColor:colors.grey_light,
    marginTop:15,
    borderRadius:10
  },
  addButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black
  },
  addContactForm: {
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    alignItems:'center',
    paddingHorizontal:10, 
    marginBottom: 16,
    fontFamily: Fonts.regular,
    height: 50,
    color:"black",
    placeholderTextColor:'black'
  },
  confirmButton: {
    backgroundColor: colors.black,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: colors.grey_light,
    opacity: 0.7
  },
  confirmText: {
    color: colors.white,
    fontFamily: Fonts.medium,
    fontSize: 16
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10
  },
  cancelButton: {
    backgroundColor: colors.grey_light,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey_light,
   
  }
});

export default Contactsheet;
