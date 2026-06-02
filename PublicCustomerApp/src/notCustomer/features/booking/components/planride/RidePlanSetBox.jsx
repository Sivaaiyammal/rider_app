import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import DestinationIcon from '../../../../assets/icons/destinationIcon';
import { Fonts } from '../../../../constants/constants';
import LocationTypes from '../../types/LocationTypes.json';
import {utils} from '../../../../utils/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashedLine from '../../../../components/Common/DashedLine';



const RidePlanSetBox = ({
  startLocation,
  endLocation,
  wayPoints = [],
  onAddWaypoint,
  onLocationClick,
  hideDestination = false,
}) => {
  const { t } = useTranslation();

  const destination = endLocation ? utils.formatAddressName(endLocation) : t('search_destination')
  const pickup = startLocation ? utils.formatAddressName(startLocation) : t('search_destination')
  const setPickupText = t('cant_find_you_set_pickup')

  const startLocationLable = startLocation?.name === "Current Location" ? t('current_location') : t('pickup_location')

  


  return (
    <View>
      {!startLocation && (
        <View style={styles.warningTextContainer}>  
          <Text style={styles.warningText}>{setPickupText}</Text>
        </View>
      )}
      <View style={styles.container}>
      {/* Pickup Row */}
      <TouchableOpacity style={[styles.row]} onPress={()=>onLocationClick(LocationTypes.START_LOCATION)}>
        <View style={styles.iconContainer}>
        <View style={[styles.dottedVerticalLine, { borderColor: 'transparent' }]} />

        <View style={[styles.iconItem, { backgroundColor: '#4caf5030' }]}> 
          <View style={styles.iconSubItem} />
        </View>
        <DashedLine color="grey" strokeWidth={1} dashLength={3} dashGap={5} vertical={true} />
        </View>
        <View style={[styles.locationContainer]}>
          <Text style={styles.label}>{startLocationLable}</Text>
          {startLocation ? <Text style={styles.address} numberOfLines={1}>{pickup}</Text>:<Text style={styles.placeHolder}>{t('search_pickup_location')}</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.stopContainer} onPress={()=>onLocationClick(LocationTypes.WAYPOINT_LOCATION)}>
        <View style={styles.iconContainer}>
       {wayPoints.length> 0 && <DashedLine color="grey" strokeWidth={1} dashLength={3} dashGap={5} vertical={true} />}
        { wayPoints.length > 0 && 
        <>
        <View style={styles.iconItem}>
          <View style={[styles.iconSubItem,{backgroundColor:'black'}]} />
        </View>
        <DashedLine color="grey" strokeWidth={1} dashLength={3} dashGap={5} vertical={true} />
         </>
        }
        </View>
       
   
          {
            wayPoints.length > 0 ?
             <View style={styles.stopLocationMainContainer}>
               <View style={styles.stopCountBadge}>
                 <Text style={styles.stopCountText}>{wayPoints.length} {wayPoints.length === 1 ? t('stop') : t('stops')}</Text>
               </View>
            </View>
            : null
          }
        </View>
        <TouchableOpacity style={styles.addStopBtn} onPress={() => onAddWaypoint(LocationTypes.WAYPOINT_LOCATION)} activeOpacity={0.8}>
            <View style={styles.plusIconBg}>
            {wayPoints.length ? <Icon name="edit" size={16} color="white" /> : <Ionicons name="add" size={18} color="white" />}
            </View>
        </TouchableOpacity>
     
      {/* Destination Row */}
      {!hideDestination && (
        <TouchableOpacity style={[styles.row]} onPress={()=>onLocationClick(LocationTypes.DESTINATION_LOCATION)} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
          <DashedLine color="grey" strokeWidth={1} dashLength={3} dashGap={5} vertical={true} />
          
           <DestinationIcon  height={23} width={23} />
          <View style={[styles.dottedVerticalLine, { borderColor: 'transparent' }]} />

          
          </View>
          <View style={[styles.locationContainer]}>
            <Text style={styles.label}>{t('destination')}</Text>
            {endLocation ? <Text style={styles.address} numberOfLines={1}>{destination}</Text>:<Text style={styles.placeHolder}>{t('search_destination')}</Text>}
          </View>
        </TouchableOpacity>
      )}
  
      </View>
    </View>
  );
};

RidePlanSetBox.propTypes = {
  startLocation: PropTypes.object,
  endLocation: PropTypes.object,
  wayPoints: PropTypes.array,
  onAddWaypoint: PropTypes.func,
  onLocationClick: PropTypes.func,
  hideDestination: PropTypes.bool,
};

const styles = StyleSheet.create({
  warningTextContainer: {
    backgroundColor: '#FFC107'+'30',
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 4,
  },
  warningText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#FFC107',
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconItem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2FE', // soft blue background
  },
  iconSubItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9', // primary blue
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  label: {
    fontFamily: Fonts.semi_bold,
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.bold,
  },
  placeHolder: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  dottedVerticalLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconBg: {
    backgroundColor: '#0F4A75',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4A75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addStopBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    marginBottom: 8,
    height: 24,
  },
  stopLocationMainContainer: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',
  },
  stopCountBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  stopCountText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.bold,
  },
});

export default RidePlanSetBox;
