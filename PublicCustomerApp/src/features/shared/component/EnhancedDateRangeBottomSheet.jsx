import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import PropTypes from 'prop-types';
import AnimatedBottomSheetWrapper from './AnimatedBottomSheetWrapper';
import { colors, Fonts } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EnhancedDateRangeBottomSheet({
  visible,
  onClose,
  title,
  fromLabel,
  toLabel,
  startDate,
  endDate,
  onPressFrom,
  onPressTo,
  cancelLabel,
  confirmLabel,
  clearLabel,
  onCancel,
  onConfirm,
  onClear,
  onClearDateRange,
  selectedStatus,
  onStatusChange,
  isDateRangeEnabled,
  onDateRangeToggle,
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DIVERGED', label: 'Diverged' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ]
}) {
  if (!visible) return null;

  // Validation: If date range is enabled, both dates must be selected and valid
  const isDateRangeValid = !isDateRangeEnabled || (startDate && endDate && startDate <= endDate);
  const isConfirmEnabled = isDateRangeValid;
  
  // Check if any filters are applied
  const hasActiveFilters = selectedStatus !== '' || (isDateRangeEnabled && startDate && endDate);

  return (
    <AnimatedBottomSheetWrapper onClose={onClose} zIndex={100000}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
        <Text style={{ fontSize: 18, fontFamily: Fonts.medium, color: colors.black, textAlign: 'center', marginBottom: 16 }}>{title}</Text>


          {/* Status Filter Section */}
          <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black, marginBottom: 12,marginLeft: 8 }}>Status Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => onStatusChange(option.value)}
                  style={{
                    borderWidth: 1,
                    borderColor: selectedStatus === option.value ? colors.black : colors.grey_light,
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    backgroundColor: selectedStatus === option.value ? colors.black : colors.white,
                  }}
                >
                  <Text style={{ 
                    fontSize: 14, 
                    fontFamily: Fonts.medium, 
                    color: selectedStatus === option.value ? colors.white : colors.black 
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Date Range Section */}
        <View style={{ marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black,marginLeft: 8 }}>Date Range</Text>
              <Switch
                value={isDateRangeEnabled}
                onValueChange={onDateRangeToggle}
                trackColor={{ false: colors.grey_light, true: colors.black }}
                thumbColor={isDateRangeEnabled ? colors.white : colors.grey}
                ios_backgroundColor={colors.grey_light}
              />
            </View>
           
          </View>
                     {isDateRangeEnabled && (
             <View>
               <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                 <View style={{ flex: 1,paddingRight: 8 }}>
                   <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: colors.grey_xxdark, marginBottom: 8,marginLeft: 8 }}>{fromLabel}</Text>
                   <TouchableOpacity onPress={onPressFrom} style={{ borderWidth: 1, borderColor: colors.grey_light, borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                     <Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: startDate ? colors.black : colors.grey_xxdark }}>
                      {startDate ? new Date(startDate).toDateString() : 'Select Date'}
                     </Text>
                   </TouchableOpacity>
                 </View>
                 <View style={{ flex: 1,paddingLeft: 8 }}>
                   <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: colors.grey_xxdark, marginBottom: 8,marginLeft: 8 }}>{toLabel}</Text>
                   <TouchableOpacity onPress={onPressTo} style={{ borderWidth: 1, borderColor: colors.grey_light, borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                     <Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: endDate ? colors.black : colors.grey_xxdark }}>
                       {endDate ? new Date(endDate).toDateString() : 'Select Date'}
                     </Text>
                   </TouchableOpacity>
                 </View>
               </View>
               {/* Invalid date range warning */}
               {isDateRangeEnabled && startDate && endDate && startDate > endDate && (
                 <View style={{ marginTop: 8, paddingHorizontal: 8 }}>
                   <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: '#EF4444', textAlign: 'center' }}>
                     From date cannot be after To date
                   </Text>
                 </View>
               )}
             </View>
           )}
        </View>

      

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
         {!hasActiveFilters && <TouchableOpacity onPress={onCancel} style={{ flex: 1, backgroundColor: colors.grey_light, borderRadius: 8, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black }}>{cancelLabel}</Text>
          </TouchableOpacity>}
          
          {hasActiveFilters && (
            <TouchableOpacity onPress={onClear} style={{ flex: 1, backgroundColor: colors.grey_light, borderRadius: 8, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black }}>{clearLabel}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={onConfirm} 
            disabled={!isConfirmEnabled}
            style={{ 
              flex: hasActiveFilters ? 1 : 2, 
              backgroundColor: isConfirmEnabled ? colors.black : colors.black+80, 
              borderRadius: 8, 
              padding: 12, 
              alignItems: 'center',
              opacity: isConfirmEnabled ? 1 : 0.6
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: isConfirmEnabled ? colors.white : colors.white+90 }}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedBottomSheetWrapper>
  );
}

EnhancedDateRangeBottomSheet.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  fromLabel: PropTypes.string,
  toLabel: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
  endDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
  onPressFrom: PropTypes.func.isRequired,
  onPressTo: PropTypes.func.isRequired,
  cancelLabel: PropTypes.string,
  confirmLabel: PropTypes.string,
  clearLabel: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearDateRange: PropTypes.func.isRequired,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  isDateRangeEnabled: PropTypes.bool,
  onDateRangeToggle: PropTypes.func.isRequired,
  statusOptions: PropTypes.array,
};
