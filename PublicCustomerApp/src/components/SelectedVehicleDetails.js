import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import BottomSheet from './BottomSheet';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';

import PeopleBlack from '../assets/image/peopleBlack.svg';
import DurationBlack from '../assets/image/durationBlack.svg';
import FareGreen from '../assets/image/fareGreen.svg';
import useLocationStore from '../store/useLocationStore';
import Rocket from '../assets/image/svgIcons/rocket.svg';
import EndBlack from '../assets/image/svgIcons/end_black.svg';
import useRideSelectionStore from '../store/useRideSelectionStore';
import {utils} from '../utils/Utils';
import ScheduleContainer from '../screens/SearchLocation/ScheduleContainer';
import BookedTick from '../assets/image/svgIcons/bookedTick.svg';
import {colors} from '../constants/constants';

const SelectedVehicleDetails = props => {
  const {selectedVehicle, HandleBookRide, selectedRide} = props;
  const {directions} = useLocationStore();
  const {scheduleDateTime} = useRideSelectionStore();

  const [showScheduleContainer, setShowScheduleContainer] = useState(false);

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  const oncloseDateTime = () => {
    setShowScheduleContainer(false);
  };

  const onConfirmDateTime = () => {
    setShowScheduleContainer(false);
  };

  const scheduleDate = scheduleDateTime?.date
    ? utils.formatDate(scheduleDateTime?.date)
    : '';
  const scheduleTime = scheduleDateTime?.time
    ? utils.timestampTo12HourFormat(scheduleDateTime?.time)
    : '';

  const isBooked = false;

  return (
    <>
      <BottomSheet>
        {selectedRide.name === 'Schedule' && isBooked && (
          <>
            <View
              style={[
                vehicleDetailsStyles.detailsContainer,
                {alignItems: 'center', backgroundColor: 'transparent'},
              ]}>
              <BookedTick />
              <View style={{marginLeft: 10}}>
                <Text style={vehicleDetailsStyles.successMsg}>
                  Your scheduled ride booked successfully
                </Text>
                <Text style={vehicleDetailsStyles.successMsgDriver}>
                  Your driver will be assigned 10 minutes before scheduled time
                </Text>
              </View>
            </View>
            <View style={vehicleDetailsStyles.priceContainer}>
              <Text style={vehicleDetailsStyles.priceContainerTxt}>
                Estimated amount to be paid {'\n'}
                <Text style={{fontSize: 12}}>(Price may vary)</Text>
              </Text>
              <Text style={vehicleDetailsStyles.priceTxt}>₹100</Text>
            </View>
          </>
        )}
        <View style={vehicleDetailsStyles.detailsContainer}>
          <Image
            source={selectedVehicle.Image}
            style={{width: 120, aspectRatio: 1}}
          />
          <View>
            <Text style={vehicleDetailsStyles.name}>
              {selectedVehicle.name}
            </Text>
            {selectedRide.name !== 'Schedule' && (
              <Text style={vehicleDetailsStyles.durationTxt}>
                {' '}
                <DurationBlack /> {selectedVehicle.duration}
              </Text>
            )}

            <Text style={vehicleDetailsStyles.durationTxt}>
              {' '}
              <PeopleBlack /> {selectedVehicle.count}
            </Text>
            {selectedRide.name !== 'Schedule' && (
              <Text style={vehicleDetailsStyles.fareTxt}>
                <FareGreen /> {selectedVehicle.total_price}
              </Text>
            )}
          </View>
        </View>
        {selectedRide.name === 'Schedule' && (
          <View style={vehicleDetailsStyles.paymentContainer}>
            <DurationBlack />
            <Text style={vehicleDetailsStyles.dateTimeText}>
              {scheduleDate + '-' + scheduleTime}
            </Text>
            <TouchableOpacity onPress={() => setShowScheduleContainer(true)}>
              <Text style={vehicleDetailsStyles.changeBtn}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={vehicleDetailsStyles.locationContainer}>
          {directions.map(item => {
            return (
              <View key={item.id} style={vehicleDetailsStyles.locationNames}>
                {getLocationIcon(item)}
                <Text style={vehicleDetailsStyles.locationTxt}>
                  {item.locationName}
                </Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
          <Text style={vehicleDetailsStyles.paymentTxt}>Payment Method</Text>
        </TouchableOpacity>
        {isBooked ? (
          <TouchableOpacity
            style={[
              vehicleDetailsStyles.cnfrmBtn,
              {backgroundColor: colors.cance_red},
            ]}
            onPress={HandleBookRide}>
            <Text style={vehicleDetailsStyles.cnfrmBtnTxt}>Cancel Booking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={vehicleDetailsStyles.cnfrmBtn}
            onPress={HandleBookRide}>
            <Text style={vehicleDetailsStyles.cnfrmBtnTxt}>
              Confirm {selectedVehicle.name} Ride
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheet>
      {showScheduleContainer && (
        <View style={{zIndex: 9999, flex: 1}}>
          <ScheduleContainer
            oncloseDateTime={oncloseDateTime}
            onConfirmDateTime={onConfirmDateTime}
            scheduleTime={scheduleDateTime.time}
            scheduleDate={
              new Date(scheduleDateTime.date).toISOString().split('T')[0]
            }
            isUpdate={true}
          />
        </View>
      )}
    </>
  );
};

export default SelectedVehicleDetails;
