/**
 * VehicleFormFields
 *
 * Renders the shared set of vehicle detail fields used by both ManualForm and
 * EditForm: vehicle type chips, make/model/year pickers, fuel type chips,
 * transmission chips, colour input, and additional info.
 *
 * Props:
 *   values      – { vehicleType, make, model, year, fuelType, transmission, features, additionalInfo }
 *   onChange    – (field, value) => void
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../constants/constants';
import {
  VEHICLE_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  MAKES_IN_INDIA,
  MODELS_BY_MAKE,
  YEAR_OPTIONS,
  ADVANCED_FEATURES,
} from '../constants/vehicleData';
import SearchablePickerModal from './SearchablePickerModal';
import styles from '../styles/vehicleStyles';

const ChipRow = ({ options, selected, onSelect }) => (
  <View style={styles.typeChipsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        style={[styles.typeChip, selected === opt.value && styles.typeChipSelected]}
        onPress={() => onSelect(opt.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.typeChipText, selected === opt.value && styles.typeChipTextSelected]}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Multi-select chip row — `selected` is an array
const MultiChipRow = ({ options, selected = [], onToggle }) => (
  <View style={styles.typeChipsRow}>
    {options.map((opt) => {
      const isOn = selected.includes(opt.value);
      return (
        <TouchableOpacity
          key={opt.value}
          style={[styles.typeChip, isOn && styles.typeChipSelected]}
          onPress={() => onToggle(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.typeChipText, isOn && styles.typeChipTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const PickerTrigger = ({ value, placeholder, onPress }) => (
  <TouchableOpacity
    style={[styles.input, styles.pickerTrigger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.pickerTriggerText, !value && styles.pickerTriggerPlaceholder]}>
      {value || placeholder}
    </Text>
    <Ionicons name="chevron-down-outline" size={18} color={colors.grey_dark} />
  </TouchableOpacity>
);

const VehicleFormFields = ({ values, onChange }) => {
  const { t } = useTranslation();
  const [makeVisible, setMakeVisible] = useState(false);
  const [modelVisible, setModelVisible] = useState(false);
  const [yearVisible, setYearVisible] = useState(false);

  const { vehicleType, make, model, year, fuelType, transmission, features, additionalInfo } = values;

  const toggleFeature = (val) => {
    const current = Array.isArray(features) ? features : [];
    const updated = current.includes(val)
      ? current.filter((f) => f !== val)
      : [...current, val];
    onChange('features', updated);
  };

  return (
    <>
      <Text style={styles.inputLabel}>{t('vehicle_type', 'Vehicle Type')} *</Text>
      <ChipRow
        options={VEHICLE_TYPE_OPTIONS}
        selected={vehicleType}
        onSelect={(v) => onChange('vehicleType', v)}
      />

      <Text style={styles.inputLabel}>{t('make', 'Make')}</Text>
      <PickerTrigger
        value={make}
        placeholder="Select make"
        onPress={() => setMakeVisible(true)}
      />

      <Text style={styles.inputLabel}>{t('model', 'Model')}</Text>
      <PickerTrigger
        value={model}
        placeholder="Select model"
        onPress={() => setModelVisible(true)}
      />

      <Text style={styles.inputLabel}>{t('year', 'Year')}</Text>
      <PickerTrigger
        value={year}
        placeholder="Select year"
        onPress={() => setYearVisible(true)}
      />

      <Text style={styles.inputLabel}>{t('fuel_type', 'Fuel Type')}</Text>
      <ChipRow
        options={FUEL_TYPE_OPTIONS}
        selected={fuelType}
        onSelect={(v) => onChange('fuelType', v)}
      />

      <Text style={styles.inputLabel}>{t('transmission', 'Transmission')}</Text>
      <ChipRow
        options={TRANSMISSION_OPTIONS}
        selected={transmission}
        onSelect={(v) => onChange('transmission', v)}
      />

      <Text style={styles.inputLabel}>{t('advanced_features', 'Advanced Features')}</Text>
      <MultiChipRow
        options={ADVANCED_FEATURES}
        selected={features}
        onToggle={toggleFeature}
      />

      <Text style={styles.inputLabel}>{t('additional_info', 'Additional Info')}</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={additionalInfo}
        onChangeText={(v) => onChange('additionalInfo', v)}
        placeholder="Any other details about your vehicle"
        placeholderTextColor={colors.grey_dark}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <SearchablePickerModal
        visible={makeVisible}
        title="Select Make"
        items={MAKES_IN_INDIA}
        onSelect={(v) => { onChange('make', v); onChange('model', ''); }}
        onClose={() => setMakeVisible(false)}
      />
      <SearchablePickerModal
        visible={modelVisible}
        title="Select Model"
        items={MODELS_BY_MAKE[make] || ['Others']}
        onSelect={(v) => onChange('model', v)}
        onClose={() => setModelVisible(false)}
      />
      <SearchablePickerModal
        visible={yearVisible}
        title="Select Year"
        items={YEAR_OPTIONS}
        onSelect={(v) => onChange('year', v)}
        onClose={() => setYearVisible(false)}
      />
    </>
  );
};

export default VehicleFormFields;
