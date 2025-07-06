import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import { colors, Fonts } from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useRideSelectionStore from '../store/useRideSelectionStore';
import { useNavigation } from '@react-navigation/native';
import useUserInfoStore from '../store/useUserInfoStore';

const Contactsheet = ({ onClose, onConfirm }) => {
  const navigation = useNavigation();
  const { userdetails } = useUserInfoStore();
  const { tripFor, contactDetails, setContactDetails, setTripFor, setSelectedContact } = useRideSelectionStore();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const handleClose = () => {
    onClose();
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
      alert('Please enter a valid Indian mobile number (e.g. +919876543210)');
      return;
    }

    const alreadyExists = contactDetails.some(c => c.phone === newContact.phone);
    if (alreadyExists) {
      alert('Contact already exists');
      return;
    }

    const updatedContacts = [...contactDetails, newContact];
    setContactDetails(updatedContacts);
    setNewContact({ name: '', phone: '+91' });
    setShowAddContact(false);
    // onConfirm?.(); // Optional: auto close
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setTripFor(contact.name);
    onConfirm();
  };

  const handleSelectMyself = () => {
    if (!userdetails?.name || !userdetails?.phone) {
      alert('User details not available');
      return;
    }

    const contact = {
      name: userdetails.name,
      phone: userdetails.phone
    };

    setSelectedContact(contact);
    setTripFor('For Myself');
    onConfirm();
  };

  const handleGetFromContacts = () => {
    navigation.navigate('ContactsList', {
      onSelectContact: (selectedContact) => {
        const alreadyExists = contactDetails.some(c => c.phone === selectedContact.phone);
        if (!alreadyExists) {
          setContactDetails([...contactDetails, selectedContact]);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book For</Text>
      
      </View>

      <TouchableOpacity 
        style={styles.myselfButton}
        onPress={handleSelectMyself}
      >
        <Text style={styles.myselfText}>Myself</Text>
        {tripFor === 'For Myself' && <Ionicons name="checkmark-circle" size={24} color={colors.green} />}
      </TouchableOpacity>

      {contactDetails.map((contact, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.contactItem}
          onPress={() => handleSelectContact(contact)}
        >
          <View>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </View>
          {tripFor === contact.name && <Ionicons name="checkmark-circle" size={24} color={colors.green} />}
        </TouchableOpacity>
      ))}

      {!showAddContact ? (
        <>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddContact(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.green} />
            <Text style={styles.addButtonText}>Add New Contact</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            style={[styles.addButton, styles.getFromContactsButton]}
            onPress={handleGetFromContacts}
          >
            <Ionicons name="people-outline" size={24} color={colors.blue} />
            <Text style={[styles.addButtonText, { color: colors.blue }]}>Choose from Contacts</Text>
          </TouchableOpacity> */}
        </>
      ) : (
        <View style={styles.addContactForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
          />
          <View style={[styles.input, {flexDirection:'row',gap:10}]}>
          <Text style={{fontFamily:Fonts.medium,fontSize:16,color:colors.black}}>+91</Text>
          <TextInput
            placeholder="Enter mobile number"
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
              <Text style={styles.confirmText}>Add Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setNewContact({ name: '', phone: '+91' });
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
    marginBottom: 20
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 18,
    color: colors.black
  },
  myselfButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  myselfText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10
  },
  getFromContactsButton: {
    borderTopWidth: 1,
    borderTopColor: colors.grey_light
  },
  addButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.green
  },
  addContactForm: {
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    alignItems:'center',
    paddingHorizontal:10, 
    marginBottom: 16,
    fontFamily: Fonts.regular
  },
  confirmButton: {
    backgroundColor: colors.green,
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
  }
});

export default Contactsheet;
