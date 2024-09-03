import {Text, StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';
import {HomeScreenContext} from '../Home/HomeScreen';

import Pulse from '../../Controllers/CustomComponent/Pulse';
import SwipeBtn from '../../Controllers/CustomComponent/SwipeBtn';
import vehicle_search from '../../Assets/HomeScreen/RideNow/vehicle_search.png';

import {
  textStyle,
  img_iconStyle,
  commonStyles,
} from '../../Styles/Home/RideNow';
import CustomModal from '../../Controllers/CustomComponent/CustomModal';

export default class VehicleSearchLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  cancelSearching(label, context) {
    this.props.onCancel(label);
    this.setModalVisible(false);
  }

  render() {
    return (
      <HomeScreenContext.Consumer>
        {context => (
          <View style={commonStyles.search_container_driver}>
            <View style={commonStyles.search_pulseContainer}>
              <Pulse style={{bottom: 20}} />
            </View>
            <View>
              <View style={commonStyles.searchVehicle_textContainer}>
                <View style={commonStyles.search_containercenter}>
                  <Image
                    style={commonStyles.search_image}
                    source={vehicle_search}
                  />
                  <Text style={commonStyles.search_boldText}>
                    Searching for Taxi...
                  </Text>
                  <Text>Your ride will start soon</Text>
                </View>
              </View>
            </View>
            <View style={commonStyles.search_container_driver}>
              {/* <SwipeBtn
                name="Slide to Cancel"
                onHandleSwipeEnd={() => {
                  this.cancelSearching('cancelSearch', context);
                }}
              /> */}
              <TouchableOpacity
            onPress={() => {
              this.setModalVisible(true);
            }}
            style={[commonStyles.homeBtn, commonStyles.cancelButton,{paddingVertical:10}]}>
            <Text style={[textStyle.textnormal, {color: 'white'}]}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
            </View>
            <CustomModal
          visible={this.state.modalVisible}
          style={commonStyles.modalContainer}
          closeModalonBackPress={()=>this.setModalVisible(false)}
          children={
            <View style={commonStyles.modalContent}>
                  <Text style={[textStyle.textnormal, commonStyles.modalText]}>
                    Are you sure to cancel the Ride
                  </Text>
                  <View style={commonStyles.modalButtonContainer}>
                    <TouchableOpacity
                      onPress={() => this.setModalVisible(false)}
                      style={[
                        commonStyles.closeButton,
                        {backgroundColor: 'black', marginRight: 10},
                      ]}>
                      <Text style={[textStyle.textnormal, {color: 'white'}]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.cancelSearching(true)}
                      style={[
                        commonStyles.closeButton,
                        commonStyles.modalButton,
                      ]}>
                      <Text style={[commonStyles.textnormal, {color: 'white'}]}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
            </View>
          }
        />
          </View>
        )}
      </HomeScreenContext.Consumer>
    );
  }
}
