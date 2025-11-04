import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DataStore } from '../../controllers/DataStore';
import { useStackScreenStore } from '../../store/useStackScreenStore';

export default function EmergencyContactScreenOverlay({ onClose }) {
  const { t } = useTranslation();
  const { setStackScreen } = useStackScreenStore();


  const storeViewdEmergencyContactScreen = async () => {
    try {
      await DataStore.storeData('emergency_contact', true);
    } catch (e) {
      console.warn('Failed to store emergency contact viewed status', e);
    } 
  }

  const saveAndProceed = async () => {
    try {
      storeViewdEmergencyContactScreen();
      onClose();
      setStackScreen('EmergencyScreen');

    } catch (e) {
      console.warn('Failed to save emergency contact', e);
      Alert.alert(t('error'), e.message);
    }
  };

  const skipAndProceed = async () => {
    storeViewdEmergencyContactScreen();
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('emergency_contact_title')}</Text>
      <Text style={styles.description}>{t('emergency_contact_description')}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.skipBtn]} onPress={skipAndProceed} testID="skip-emergency">
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={saveAndProceed} testID="save-emergency">
          <Text style={styles.saveText}>{t('add_contact')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  skipBtn: {
    backgroundColor: '#f0f0f0',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
  },
  skipText: {
    color: '#333',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
