import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import NavBar from '../../../components/NavBar';
import { colors, Fonts, actingDriverColors } from '../../../constants/constants';
import { getPassangerVehicles } from '../../../API/EndPoints/EndPoints';
import useRideBookingInfo from '../../booking/store/useRideBookingInfo';
import {
  VEHICLE_TYPE_OPTIONS,
  VEHICLE_TYPE_ICON,
  getStockImage,
} from '../../myVehicles/constants/vehicleData';

const VehicleItem = ({ vehicle, selected, onPress, isDefault }) => {
  const iconName = VEHICLE_TYPE_ICON[vehicle.type] || 'car-outline';
  const typeLabel =
    VEHICLE_TYPE_OPTIONS.find((o) => o.value === vehicle.type)?.label ||
    vehicle.type ||
    '';
  const meta = [typeLabel, vehicle.make, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.cardIcon, selected && styles.cardIconSelected, { overflow: 'hidden' }]}>
        {vehicle.photo || getStockImage(vehicle.type) ? (
          <Image
            source={vehicle.photo ? { uri: vehicle.photo } : getStockImage(vehicle.type)}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        ) : (
          <Ionicons
            name={iconName}
            size={24}
            color={selected ? actingDriverColors.secondary : colors.grey_xxdark}
          />
        )}
      </View>
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.cardRegNo, selected && styles.cardRegNoSelected]}>
            {vehicle.regNo}
          </Text>
          {isDefault && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Ionicons name="star" size={9} color="#D97706" />
              <Text style={{ fontSize: 10, color: '#D97706', fontWeight: '700' }}>Default</Text>
            </View>
          )}
        </View>
        {!!meta && <Text style={styles.cardMeta}>{meta}</Text>}
        {vehicle.verified && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={12} color={actingDriverColors.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={[styles.selectorCheck, selected && styles.selectorCheckActive]}>
        {selected && (
          <Ionicons name="checkmark" size={12} color={colors.white} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ActingDriverVehicleSelectScreen = () => {
  const { t } = useTranslation();
  const { goBack, setStackScreen, goBackToScreen } = useStackScreenStore();
  const { actingDriverVehicle, setActingDriverVehicle, setActingDriverMaxSpeed } = useRideBookingInfo();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(actingDriverVehicle?._id?.toString() || null);
  const [defaultVehicleId, setDefaultVehicleId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getPassangerVehicles({ _t: Date.now() });
        if (response.success) {
          const list = response.vehicles || [];
          setVehicles(list);
          
          const defaultV = list.find(v => v.isDefault);
          if (defaultV) {
            setDefaultVehicleId(defaultV._id?.toString());
          }

          // If the previously selected vehicle no longer exists in the list, clear it
          const stillExists = actingDriverVehicle?._id && list.some(v => v._id?.toString() === actingDriverVehicle._id?.toString());
          if (!stillExists) {
            setActingDriverVehicle(null);
            setSelectedId(defaultV ? defaultV._id?.toString() : null);
          } else if (!actingDriverVehicle?._id && defaultV) {
            setSelectedId(defaultV._id?.toString());
          }
        }
      } catch (_) {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedVehicle = vehicles.find(
    (v) => v._id?.toString() === selectedId,
  );

  const handleContinue = () => {
    if (!selectedVehicle) return;
    setActingDriverVehicle(selectedVehicle);
    if (selectedVehicle.maxSpeed) {
      setActingDriverMaxSpeed(String(selectedVehicle.maxSpeed));
    }
    goBack();
  };

  const handleAddVehicle = () => {
    setStackScreen('MyVehiclesScreen', { action: 'add' });
  };

  return (
    <View style={styles.container}>
      <NavBar
        title={t('select_your_vehicle', 'Select Your Vehicle')}
        onBackPress={goBack}
        withBg
        withShadow
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t(
            'acting_driver_vehicle_subtitle',
            'Choose a vehicle to find a driver for',
          )}
        </Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={actingDriverColors.primary} />
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="car-outline" size={64} color={colors.grey_dark} />
            <Text style={styles.emptyTitle}>
              {t('no_vehicles', 'No Vehicles Added')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t(
                'no_vehicles_acting_driver',
                'Add your vehicle details to quickly find a driver',
              )}
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddVehicle}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.addBtnText}>
                {t('add_vehicle', 'Add Vehicle')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item, idx) =>
              item._id?.toString() || String(idx)
            }
            renderItem={({ item }) => (
              <VehicleItem
                vehicle={item}
                selected={selectedId === item._id?.toString()}
                isDefault={defaultVehicleId === item._id?.toString()}
                onPress={() => setSelectedId(item._id?.toString())}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={handleAddVehicle}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={actingDriverColors.secondary}
                />
                <Text style={styles.addMoreBtnText}>
                  {t('add_another_vehicle', 'Add Another Vehicle')}
                </Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>

      {vehicles.length > 0 && (
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedVehicle && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedVehicle}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            {t('continue', 'Continue')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ActingDriverVehicleSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: actingDriverColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 20,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: actingDriverColors.secondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  addBtnText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 15,
    color: colors.white,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: actingDriverColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: actingDriverColors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: actingDriverColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconSelected: {
    backgroundColor: '#E2E8F0',
  },
  cardInfo: {
    flex: 1,
  },
  cardRegNo: {
    fontFamily: Fonts.semi_bold,
    fontSize: 15,
    color: actingDriverColors.secondary,
  },
  cardRegNoSelected: {
    color: actingDriverColors.secondary,
  },
  cardMeta: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.grey_xxdark,
    marginTop: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  verifiedText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: actingDriverColors.success,
  },
  selectorCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectorCheckActive: {
    borderColor: actingDriverColors.primary,
    backgroundColor: actingDriverColors.primary,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: actingDriverColors.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  addMoreBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: actingDriverColors.secondary,
  },
  continueButton: {
    backgroundColor: actingDriverColors.secondary,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: actingDriverColors.border,
  },
  continueButtonText: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: colors.white,
  },
});


