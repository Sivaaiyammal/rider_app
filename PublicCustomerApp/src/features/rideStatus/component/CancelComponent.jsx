import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

const REASONS = [
  'Driver is taking too long',
  'Driver asked to cancel',
  'Driver not responding',
  'Booked by mistake',
  'Fare is too high (surge)',
  'Other',
];

const CancelComponent = ({ onClose, onCancel }) => {
  const [selected, setSelected] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleSelect = (reason) => {
    setSelected(reason);
    if (reason !== 'Other') {
      setOtherReason('');
    }
  };

  const handleConfirm = () => {
    if (onCancel) {
      if (selected === 'Other') {

        if(!otherReason.trim()) {
            Alert.alert('Please enter a reason');
            return;
        }

    
        onCancel(otherReason);
        
      } else {
        onCancel(selected);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why are you cancelling the trip?</Text>
      <View style={styles.box}>
        <ScrollView>
          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.row}
              onPress={() => handleSelect(reason)}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxOuter}>
                {selected === reason && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
          {selected === 'Other' && (
            <View style={{ marginTop: 8 }}>
              <TextInput
                style={styles.input}
                placeholder="Enter your reason"
                value={otherReason}
                onChangeText={setOtherReason}
                multiline
              />
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>No cancellation fees will be charged</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.goBackBtn} onPress={onClose}>
          <Text style={styles.goBackText}>GO BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[  styles.confirmBtn, {opacity: !selected || (selected === 'Other' && !otherReason.trim()) ? 0.5 : 1}]}
          onPress={handleConfirm}
         
        >
          <Text style={styles.confirmText}>CONFIRM CANCELLATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  box: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#222',
    borderRadius: 3,
  },
  reasonText: {
    fontSize: 15,
    color: '#222',
  },
  noteBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 24,
    alignItems: 'center',
  },
  noteText: {
    color: '#b59f3b',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goBackBtn: {
    flex: 1,
    backgroundColor: '#101828',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  goBackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 2,
    borderWidth: 1.5,
    borderColor: '#ff4d4f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  confirmText: {
    color: '#ff4d4f',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    minHeight: 40,
    marginTop: 4,
  },
});

export default CancelComponent;
