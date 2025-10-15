import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import AddEmergencyContactScreen from './AddEmergencyContactScreen'
import { useEmergencyContactsStore } from '../store/useEmergencyContactsStore';
const EmergencyHomeScreen = () => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const contacts = useEmergencyContactsStore((s) => s.contacts);
  const [currentScreen, setCurrentScreen] = useState('EmergencyHomeScreen');

 
  const handleAddEmergencyContact = () => {
    setCurrentScreen('AddEmergencyContactScreen');
  };

  const handleBackBtn = () => {
    goBack();
  };




  if (currentScreen === 'AddEmergencyContactScreen') {
    return <AddEmergencyContactScreen onBack={() => setCurrentScreen('EmergencyHomeScreen')} />;
  }

  

  return (
    <View style={styles.container}>
      <NavBar withBg onBackPress={handleBackBtn} title={'Emergency Contacts'} />
      <View style={styles.contentContainer}>
        {contacts.length === 0 ? (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>No Emergency Contact</Text>
              <Text style={styles.infoSubText}>
                Add a trusted contact who can be notified in case of emergency.
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddEmergencyContact}>
              <Text style={styles.buttonText}>Add Emergency Contact</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.contactItem}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity style={styles.button}
              onPress={handleAddEmergencyContact}
              disabled={contacts.length >= 5}
            >
              <Text style={styles.buttonText}>
                {contacts.length >= 5 ? 'Edit Contacts' : 'Add Emergency Contact'}
              </Text>
            </TouchableOpacity>
            {contacts.length >= 5 && (
              <Text style={styles.limitText}>Maximum of 5 contacts reached</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default EmergencyHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
  },
  contactItem: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  contactName: {
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  contactPhone: {
    color: '#555',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoSubText: {
    color: '#757575',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.6,
    fontSize: 16,
  },
  limitText: {
    marginTop: 8,
    color: '#999',
  },
});
