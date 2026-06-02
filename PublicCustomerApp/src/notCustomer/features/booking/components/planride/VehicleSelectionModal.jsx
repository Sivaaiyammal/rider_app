import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../../../constants/constants';
import { VEHICLE_TYPE_ICON } from '../../../myVehicles/constants/vehicleData';
const VehicleSelectionModal = ({
  visible,
  onClose,
  vehiclesList,
  selectedVehicle,
  onSelect,
  themeMap,
}) => {

  const renderVehicleItem = ({ item }) => {
    const isSelected = selectedVehicle?.regNo === item.regNo;
    const theme = themeMap?.[item.type?.toLowerCase()] || themeMap?.['hatchback'];

    return (
      <TouchableOpacity
        style={[styles.vehicleCard, isSelected && { borderColor: theme.primary, backgroundColor: `${theme.primary}05` }]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Ionicons name={VEHICLE_TYPE_ICON[item.type?.toLowerCase()] || 'car-sport'} size={50} color={theme.primary} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.regNoText}>{item.regNo}</Text>
          <View style={styles.modelRow}>
            <Text style={styles.makeModelText} numberOfLines={1}>{item.make} {item.model}</Text>
            <View style={[styles.badge, { backgroundColor: `${theme.primary}15` }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>{item.type?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.radioContainer}>
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={24}
            color={isSelected ? theme.primary : '#CBD5E1'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Vehicle</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="close-circle" size={26} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {vehiclesList?.length > 0 ? (
            <FlatList
              data={vehiclesList}
              keyExtractor={(item) => item.regNo}
              renderItem={renderVehicleItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
               <Ionicons name="car-outline" size={40} color="#94A3B8" />
               <Text style={styles.emptyText}>No vehicles found</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: '40%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#1E293B',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  imageContainer: {
    width: 70,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  regNoText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  makeModelText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
    marginRight: 8,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  radioContainer: {
    marginLeft: 12,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 12,
  }
});

export default VehicleSelectionModal;
