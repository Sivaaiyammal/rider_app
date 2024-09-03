import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import React, {Component} from 'react';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import HomeLocationIcon from '../../../Assets/HomeScreen/RideNow/homeLocation.png';
import DropLocationIcon from '../../../Assets/HomeScreen/RideNow/dropLocation.png';
import Rightarrow_blackIcon from '../../../Assets/HomeScreen/RideNow/rightarrow_black.png';
import call_icon from '../../../Assets/HomeScreen/RideNow/call_icon.png';
import message_icon from '../../../Assets/HomeScreen/RideNow/message_icon.png';
import ProfileImage from '../../../Assets/HomeScreen/Profile.webp';
import cross_white from '../../../Assets/HomeScreen/cross_white.png';
import ratings from '../../../Assets/HomeScreen/RideNow/ratings.png';

import {
  textStyle,
  img_iconStyle,
  commonStyles,
} from '../../../Styles/Home/RideNow';

import CustomModal from '../../../Controllers/CustomComponent/CustomModal';
import TranslationFile from '../../locales/TranslationFile';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default class GetDriverDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
    this.translation = getRedirection(TranslationFile);
  }

  callDriver(phoneNumber) {
    Linking.openURL(`tel:${phoneNumber}`).catch(error =>
      console.error('Failed to make a phone call:', error),
    );
  }

  messageDriver(phoneNumber) {
    Linking.openURL(`sms:${phoneNumber}`).catch(error =>
      console.error('Failed to send a message:', error),
    );
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
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

  cancelSearching(label, context) {
    this.props.onCancel(label);
    this.setModalVisible(false);
  }

  render() {
    const items = this.props.itemData;
    const liveData = this.props.liveData

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '94%',
          paddingBottom: windowHeight * 0.2,
          gap: 10,
          alignSelf: 'center',
        }}>
        {/* Heading  */}
        <View
          style={{
            // gap: 20,
            // padding: 15,
          }}>
          <View
            style={{
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
              // padding: 10,
            }}>
            <Text style={[textStyle.textbold]}>
              {items.get_driver_result.status == '0' &&
                `${this.translation['your_driver_will_reach_your_location_in']}`}
              {items.get_driver_result.status == '1' && `${this.translation['Your_driver_has_reached_your_location']}`}
              {items.get_driver_result.status == '2' && `${this.translation['you_can_reach_your_destination_in']}`}
            </Text>
            <Text style={[textStyle.text_extrabold, {color: 'orange'}]}>
              {(liveData && liveData?.live.km == '0') ? `${this.translation['waiting']}` : liveData && `${liveData.live.km} KM ${liveData.live.duration} Minutes` || 'Waiting'}
            </Text>
          </View>
        </View>

      {/* car driver details  */}
        <View style={commonStyles.carDriver_details}>
          <View style={commonStyles.conatinerRow}>
            <View style={[img_iconStyle.iconContainer_large, {width: '20%'}]}>
              <Image
                style={[img_iconStyle.iconLarge, {width: '60%'}]}
                resizeMode="contain"
                source={items.get_driver_result.driver_pic ? {uri: items.get_driver_result.driver_pic} : ProfileImage}
              />
            </View>
            <View
              style={{
                gap: 5,
              }}>
              <Text style={textStyle.textbold}>
                {items.get_driver_result.name}
              </Text>

              <View style={commonStyles.conatinerRow}>
                <Image style={img_iconStyle.iconsmall} source={ratings} />
                <Text commonStyles={textStyle.textsmall}>
                  {items.get_driver_result.rating || 0}
                </Text>
              </View>
            </View>
          </View>
          <View style={commonStyles.conatinerRow}>
            <View style={[img_iconStyle.iconContainer_large, {width: '20%'}]}>
              <Image
                style={[img_iconStyle.iconLarge, {width: '60%'}]}
                resizeMode="contain"
                source={items.get_driver_result.front_view ? {uri: items.get_driver_result.front_view} : ProfileImage}
              />
            </View>
            <View
              style={{
                gap: 5,
              }}>
              <Text style={textStyle.textbold}>
                {items.get_driver_result.vehicle_no}
              </Text>
              <Text commonStyles={textStyle.textsmall}>
                {items.get_driver_result.model}
              </Text>
            </View>
          </View>
        </View>

        {/* amount to pay  */}
        <TouchableOpacity
          style={[commonStyles.getHelpContainer, {backgroundColor: '#f8f9d2'}]}>
          <Text style={textStyle.textnormal}>{this.translation['Estimated_amount_to_be_paid']}</Text>
          <Text style={{fontWeight: 'bold'}}> ₹{items.get_driver_result.estimate_fare} </Text>
        </TouchableOpacity>

        {items.get_driver_result.status == '2' ? (
          <>
            {/* location details  */}
            <View style={[commonStyles.tripDetailsContainer]}>
              <Text style={textStyle.textnormal}>{this.translation['location_details']}</Text>
              <View
                style={[
                  commonStyles.location,
                  {backgroundColor: '#f5f5f5', marginTop: 10},
                ]}>
                <View style={commonStyles.locContent}>
                  <Image
                    style={img_iconStyle.locIcon}
                    source={HomeLocationIcon}
                  />
                  <View>
                    <Text style={textStyle.textsmall}>{this.translation['start_location']}</Text>
                    {/* <Text style={textStyle.textnormal}>Home</Text> */}
                    <Text style={textStyle.textsmall}>
                      {this.props.startLocationName}
                    </Text>
                  </View>
                </View>
                <View style={{position: 'absolute', left: 22, top: 40, gap: 4}}>
                  {this.renderVerticalLines(5)}
                </View>

                <View style={commonStyles.locIconContainer}>
                  <Image
                    style={img_iconStyle.locIcon}
                    source={DropLocationIcon}
                  />
                  <View>
                    <Text style={textStyle.textsmall}>{this.translation['end_location']}</Text>
                    {/* <Text style={textStyle.textnormal}>Virtualmaze</Text> */}
                    <Text style={textStyle.textsmall}>
                      {this.props.endLocationName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* payment details  */}

            {/* <TouchableOpacity
              style={[
                commonStyles.getHelpContainer,
                {backgroundColor: '#f5f5f5'},
              ]}>
              <Text style={textStyle.textnormal}>Change Payment Method</Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Text style={[textStyle.textnormal, {color: '#189a76'}]}>
                  Cash
                </Text>
                <Image
                  style={{
                    width: 16,
                    height: 16,
                    objectFit: 'contain',
                  }}
                  source={Rightarrow_blackIcon}
                />
              </TouchableOpacity>
            </TouchableOpacity> */}
          </>
        ) : (
          //  call,message, cancel buttons //
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 15,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.callDriver(items.get_driver_result.phone);
              }}
              style={commonStyles.call_button}>
              <View
                style={[img_iconStyle.iconContainer_large, {marginRight: 20}]}>
                <Image
                  style={[img_iconStyle.iconLarge, {width: '36%'}]}
                  resizeMode="contain"
                  source={call_icon}
                />
              </View>
              <Text style={[textStyle.textbold, {color: 'white'}]}>
              {this.translation['call_driver']}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                this.messageDriver(items.get_driver_result.phone)
              }
              style={[
                img_iconStyle.iconContainer_xlarge,
                {backgroundColor: '#4289e5'},
              ]}>
              <Image
                style={[img_iconStyle.icon, {width: '36%', height: 20}]}
                source={message_icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setModalVisible(true)}
              style={[
                img_iconStyle.iconContainer_xlarge,
                {backgroundColor: '#ff6060'},
              ]}>
              <Image
                style={[img_iconStyle.icon, {width: '36%', height: 20}]}
                source={cross_white}
              />
            </TouchableOpacity>
          </View>
        )}
        <CustomModal
          visible={this.state.modalVisible}
          style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}
          closeModalonBackPress={()=>this.setModalVisible(false)}
          children={
            <View style={commonStyles.modalContent}>
              <Text style={textStyle.textnormal}>
              {this.translation['are_you_sure_to_cancel_the_Ride']}
              </Text>
              <View style={commonStyles.buttonComponent}>
                <TouchableOpacity
                  onPress={() => this.setModalVisible(false)}
                  style={[commonStyles.closeButton, {backgroundColor: 'red'}]}>
                  <Text style={[textStyle.textnormal, {color: 'white'}]}>
                  {this.translation['cancel']}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.cancelSearching(true)}
                  style={[
                    commonStyles.closeButton,
                    {backgroundColor: 'black'},
                  ]}>
                  <Text style={[commonStyles.textnormal, {color: 'white'}]}>
                  {this.translation['confirm']}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </ScrollView>
    );
  }
}
