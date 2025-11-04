import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import { DataStore } from '../controllers/DataStore';
import { Platform } from 'react-native';
import useConfigStore from '../store/useConfigStore';
export default function UpdateOverlay({ visible, mode, onClose }) {
  if (!visible) return null;
  const { appConfig } = useConfigStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const storeUrl = Platform.select({
        android: appConfig.appLink?.android,
        ios: appConfig.appLink?.ios,
      });
      
      if (!storeUrl) {
        console.error('Store URL not found');
        return;
      }

      await Linking.openURL(storeUrl);
    } catch (error) {
      console.error('Error opening store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await DataStore.storeData('updateSkipDate', new Date().toISOString());
      onClose();
    } catch (error) {
      console.error('Error skipping update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>App Update Available</Text>
          <Text style={styles.message}>
            A newer version of the app is available. Please update for the best experience.
            {mode === 'force' && '\n\nThis update is required to continue using the app.'}
          </Text>

          <TouchableOpacity 
            onPress={handleUpdate} 
            style={[styles.updateButton, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Now</Text>
            )}
          </TouchableOpacity>

          {mode === 'optional' && (
            <TouchableOpacity 
              onPress={handleSkip} 
              style={[styles.skipButton, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  message: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 16,
    padding: 8,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14,
  },
});