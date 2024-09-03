import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import React, {Component} from 'react';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

import {utils} from '../../../Controllers/utils';

import HomeLocationIcon from '../../../Assets/HomeScreen/RideNow/homeLocation.png';
import DropLocationIcon from '../../../Assets/HomeScreen/RideNow/dropLocation.png';
import PricetagIcon from '../../../Assets/HomeScreen/RideNow/pricetag.png';
import Rightarrow_blackIcon from '../../../Assets/HomeScreen/RideNow/rightarrow_black.png';
import OptimizeIcon from '../../../Assets/HomeScreen/RideNow/optimize.png';
import schedule_booked from '../../../Assets/HomeScreen/RideNow/schedule_booked.png';

import DurationBlackIcon from '../../../Assets/HomeScreen/RideNow/duration_black.png';
import UserCapacityBlackIcon from '../../../Assets/HomeScreen/RideNow/user_black.png';
import LeftArrowImage from '../../../Assets/HomeScreen/InstantTrips/LeftArrow.webp';

import {
  textStyle,
  img_iconStyle,
  commonStyles,
} from '../../../Styles/Home/RideNow';
import {MapIconsStyle} from '../../../Styles/Home/Home';
import CustomModal from '../../../Controllers/CustomComponent/CustomModal';
import RadioButton from '../../../Controllers/CustomComponent/RadioButton';
import PaymentMethodDetails from './paymentScreen';
import TranslationFile from '../../locales/TranslationFile';

export class SelectedVehicleInfo extends Component {
  constructor(props) {
    super(props);

    this.paymentTypeOptions = [
      {
        id: '1',
        title: 'Cash',
        value: 'cash',
        isIcon: true,
        isEnabled: true,
        // icon: OnewayTripIcon,
      },
      {
        id: '2',
        title: 'UPI',
        value: 'upi',
        isIcon: true,
        isEnabled: true,
        // icon: OnewayTripIcon,
      },
    ];

    this.state = {
      modalVisible: false,
      modal_type: false,
      modal_payVisible: false,
      currentLabel: '',
      currentItemData: null,
      selectedPaymentType: this.paymentTypeOptions[1] || undefined,
    };
    this.translation = getRedirection(TranslationFile);
  }

  onConfirm(label, itemDate) {
    this.props.confirmBooking(label, itemDate);

    // console.log('hari-->>itemDate-->>', itemDate);

    // this.setState({
    //   modal_payVisible: true,
    //   currentLabel: label,
    //   currentItemData: itemDate,
    // });
  }

  RideBookConfirm = () => {
    let label = this.state.currentLabel;
    let itemDate = this.state.currentItemData;
    this.props.confirmBooking(label, itemDate);
  };

  hideModal = () => {
    this.setState({modal_payVisible: false});
  };

  paymentMethodModelContainer() {
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modal_payVisible}
          onRequestClose={() => {
            this.setState({modal_payVisible: false});
          }}>
          {/* <View style={{ flex: 1, backgroundColor: '#fff' }}> */}
          <PaymentMethodDetails
            onTouchOut={this.hideModal}
            callBack={this.RideBookConfirm}
          />
          {/* </View> */}
        </Modal>
      </View>
    );
  }

  renderVerticalLines = count => {
    const verticalLines = [];
    for (let i = 0; i < count; i++) {
      verticalLines.push(
        <View
          key={i}
          style={[
            commonStyles.verticalLine,
            {width: 1, height: 6, backgroundColor: 'black'},
          ]}
        />,
      );
    }
    return verticalLines;
  };

  setModalVisible(visible, type) {
    this.setState({modalVisible: visible, modal_type: type});
  }

  update_patmerny(option) {
    this.props.getPaymentMethod(option);
  }

  onPaymentChange(option) {
    this.setState({selectedPaymentType: option, modalVisible: false});
    this.update_patmerny(option.title);
    if (this.props.isBooked){
      this.props.changeDateTime('updatepayment',option.id);
    }
  }

  ChangeDateAndTime() {
    this.props.changeDateTime('updateDate');
  }

  cancelSearching(label, context) {
    this.props.onCancel(label);
    this.setModalVisible(false);
  }

  render() {
    const {type, isBooked, date_time, location_name, isLoadingBtn} = this.props;
    let {label, fare, capacity, image_big, color, duration, image} =
      this.props.itemData;

    let selectedOption = this.state.selectedPaymentType;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* Booking Successfull */}
        {type === 'Schedule' && isBooked && (
          <>
            <View style={commonStyles.successContainer}>
              <Image
                source={schedule_booked}
                style={commonStyles.successImage}
              />
              <View style={commonStyles.successTextContainer}>
                <Text style={commonStyles.boldText}>
                {this.translation['Your_scheduled_ride_booked_successfully']}
                </Text>
                <Text style={commonStyles.successDescription}>
                {this.translation['Your_scheduled_ride_booked_successfully']}
                </Text>
              </View>
            </View>

            {/* Amount to Pay */}
            <TouchableOpacity
              style={[
                commonStyles.getHelpContainer,
                {backgroundColor: '#f8f9d2'},
              ]}>
              <View>
                <Text style={textStyle.textnormal}>
                {this.translation['Estimated_amount_to_be_paid']}
                </Text>
                <Text style={{textAlign: 'center'}}>( {this.translation['price_may_vary']})</Text>
              </View>
              <Text style={{fontWeight: 'bold'}}>₹ {fare.toFixed(2)} </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Car Details */}
        <View style={commonStyles.carDetailsContainer}>
          <Image source={image} style={commonStyles.carImage} />
          <View style={commonStyles.carDetailsTextContainer}>
            <Text style={commonStyles.carName}>{label}</Text>
            <View style={commonStyles.carDistanceContainer}>
              <Image
                style={commonStyles.locationIcon}
                source={DurationBlackIcon}
              />
              <Text style={{fontSize: 13, color: 'black'}}>
              {utils.convertSecondsToReadable(duration)} away
              </Text>
            </View>
            <View style={commonStyles.carCapacityContainer}>
              <Image
                style={commonStyles.locationIcon}
                source={UserCapacityBlackIcon}
              />
              <Text style={{fontSize: 13, color: 'black'}}>{capacity}</Text>
            </View>
            <View style={commonStyles.carPriceContainer}>
              <Image style={commonStyles.locationIcon} source={PricetagIcon} />
              <Text style={commonStyles.carPriceText}>₹{fare.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Date and Time */}
        {type === 'Schedule' && (
          <TouchableOpacity
            onPress={() => this.ChangeDateAndTime()}
            style={[
              commonStyles.getHelpContainer,
              {backgroundColor: '#f5f5f5', width: '94%'},
            ]}>
            <Text style={textStyle.textnormal}>
              {date_time.date.day}, {date_time.date.month} {date_time.date.year}{' '}
              {'-'} {utils.timestampTo12HourFormat(date_time.time)}{' '}
            </Text>
            <View style={commonStyles.changeDateContainer}>
              <Text style={[textStyle.textnormal, {color: '#189a76'}]}>
              {this.translation['change']}
              </Text>
              <Image
                style={commonStyles.location_Icon}
                source={Rightarrow_blackIcon}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Address */}
        <View style={commonStyles.tripDetailsContainer}>
          <Text style={textStyle.textnormal}>{this.translation['location_details']}</Text>
          <View
            style={[
              commonStyles.location,
              {backgroundColor: '#f5f5f5', marginTop: 10},
            ]}>
            <View style={commonStyles.locContent}>
              <Image style={img_iconStyle.locIcon} source={HomeLocationIcon} />
              <View>
                <Text style={textStyle.textnormal}>{this.translation['start_location']}</Text>
                <Text style={textStyle.textsmall}>
                  {location_name[0].startLocation}
                </Text>
              </View>
            </View>
            <View
              style={{
                position: 'absolute',
                left: 22,
                top: 40,
                gap: 4,
                zIndex: -1,
              }}>
              {this.renderVerticalLines(
                location_name[0].wayPoints.length === 0
                  ? 4
                  : location_name[0].wayPoints.length * 6,
              )}
            </View>
            {location_name[0].wayPoints.map((item, index) => {
              return (
                <View style={commonStyles.locIconContainer}>
                  <Image
                    style={[img_iconStyle.locIcon, {backgroundColor: 'white'}]}
                    source={DropLocationIcon}
                  />
                  <View>
                    <Text style={textStyle.textsmall}>{item.name}</Text>
                  </View>
                </View>
              );
            })}
            <View style={commonStyles.locIconContainer}>
              <Image style={img_iconStyle.locIcon} source={DropLocationIcon} />
              <View>
                <Text style={textStyle.textnormal}>{this.translation['end_location']}</Text>
                <Text style={textStyle.textsmall}>
                  {location_name[0].endLocation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <TouchableOpacity
          onPress={() => {
            this.setModalVisible(true, 'payment');
          }}
          style={[commonStyles.getHelpContainer, {backgroundColor: '#f5f5f5'}]}>
          <Text style={textStyle.textnormal}>{this.translation['change_payment_method']}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <View>
              <Text style={[textStyle.textnormal, {color: '#189a76'}]}>
                {this.state.selectedPaymentType.title}{' '}₹{fare.toFixed(2)}
              </Text>
            </View>
            <Image
              style={{
                width: 16,
                height: 16,
                objectFit: 'contain',
              }}
              source={Rightarrow_blackIcon}
            />
          </View>
        </TouchableOpacity>
        {/* <View
          style={[
            commonStyles.getHelpContainer,
            {
              backgroundColor: '#f5f5f5',
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          ]}>
          <Text style={textStyle.textnormal}>Payment Method</Text>
          <Text style={[textStyle.textnormal, {paddingTop: 5, fontSize: 14}]}>
            Booking charge of ₹ 100 should be paid for confirmation, it will be
            leived off in final payment after ride completed
          </Text>
        </View> */}
        {/* Confirm Booking Button */}
        {!isBooked && (
          <View style={commonStyles.confirmButtonContainer}>
            <TouchableOpacity
              onPress={() =>
                type === 'Schedule'
                  ? this.onConfirm('Schedule', this.props.itemData)
                  : this.onConfirm('Ride Now')
              }
              style={commonStyles.confirmButton}>
              {isLoadingBtn ? (
                <Text style={commonStyles.confirmButtonText}>Loading....</Text>
              ) : (
                <Text style={commonStyles.confirmButtonText}>
                  {this.translation['confirm']} {label} {this.translation['ride']}
                </Text>
              )}
            </TouchableOpacity>
            <View style={commonStyles.optimizeButtonContainer}>
              <Image
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  objectFit: 'contain',
                }}
                source={OptimizeIcon}
              />
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {type === 'Schedule' && isBooked && (
          <TouchableOpacity
            onPress={() => {
              this.setModalVisible(true, 'cancel');
            }}
            style={[commonStyles.homeBtn, commonStyles.cancelButton]}>
            <Text style={[textStyle.textnormal, {color: 'white'}]}>
            {this.translation['cancel_booking']}
            </Text>
          </TouchableOpacity>
        )}
        <CustomModal
          visible={this.state.modalVisible}
          style={commonStyles.modalContainer}
          closeModalonBackPress={()=>this.setModalVisible(false)}
          children={
            <View style={commonStyles.modalContent}>
              {this.state.modal_type === 'cancel' ? (
                <>
                  <Text style={[textStyle.textnormal, commonStyles.modalText]}>
                  {this.translation['are_you_sure_to_cancel_the_Ride']}
                  </Text>
                  <View style={commonStyles.modalButtonContainer}>
                    <TouchableOpacity
                      onPress={() => this.setModalVisible(false)}
                      style={[
                        commonStyles.closeButton,
                        {backgroundColor: 'black', marginRight: 10},
                      ]}>
                      <Text style={[textStyle.textnormal, {color: 'white'}]}>
                      {this.translation['cancel']}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.cancelSearching(true)}
                      style={[
                        commonStyles.closeButton,
                        commonStyles.modalButton,
                      ]}>
                      <Text style={[commonStyles.textnormal, {color: 'white'}]}>
                      {this.translation['confirm']}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[textStyle.textnormal, commonStyles.modalText]}>
                    {this.translation['choose_preferred_payment_method']}
                  </Text>
                  <View style={{marginTop: 10}}>
                    {this.paymentTypeOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => this.onPaymentChange(option)}>
                        <RadioButton
                          selected={option.value == selectedOption.value}
                          labelName={option.title}
                          style={{margin: 20}}
                          Colors={'#000'}
                          isDisableSelectedBG={true}
                          isInnerCircleDisable={true}
                          isLabelLeft={true}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          }
        />
        {/* {this.paymentMethodModelContainer()} */}
      </ScrollView>
    );
  }
}

export default SelectedVehicleInfo;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    paddingBottom: 100,
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    marginBottom: 4,
    alignSelf: 'flex-start',
    left: 20,
  },
});
