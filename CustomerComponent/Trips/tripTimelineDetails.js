import React, {Component} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import TripSummaryWaypoints from './TripSummaryWaypoints';
import { ScrollView } from 'react-native-gesture-handler';

import TimeImage from '../../Assets/Trips/tripDetails/watch_black.webp';
import personImage from '../../Assets/Trips/tripDetails/person.webp';
import DriverIcon from "../../Assets/Trips/tripDetails/driverIcon.svg";
import locationImage from '../../Assets/Trips/tripDetails/trapLocation.webp';
import EndLocationImage from '../../Assets/HomeScreen/InstantTrips/EndLocation.webp'
import HelpImage from '../../Assets/HomeScreen/Help.webp'
import SosImage from '../../Assets/HomeScreen/SOS.webp'

// styles

import { buttonStyles } from '../../Styles/Home/Home'
import ProfileImage from '../../Assets/HomeScreen/Profile.webp'
import { Colors } from 'react-native/Libraries/NewAppScreen';

class TimelineTrip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {id: '1', event: 'Driver Start Location'},
        {id: '2', event: 'Picked Up'},
        {id: '3', event: 'Waiting'},
      ],
    };
  }

  TimelineItem = ({item}) => (
    <View style={styles.itemContainer}>
      <View style={styles.dot} />
      <Text style={styles.itemText}>{item.event}</Text>
    </View>
  );

  render() {
    let {data} = this.state;

    return (
      <ScrollView style={styles.container}>
          <Text style={{fontWeight: 'bold', padding: 10, fontSize: 18, color: 'black', textAlign: 'center' }}>Today, 01 Jan 23, 10:00am</Text>
          <Text style={{ fontSize: 14, color: '#616161', textAlign: 'center'}}>Today, 01 Jan 23, 10:00am</Text>
          <View style={styles.distanceContainer}>
            <View style={styles.distanceItemContainer}>
              <Image source={locationImage} style={styles.distanceItemImage} />
              <Text style={{ fontSize: 12, color: '#212121' }}>12 Km</Text>
            </View>
            <View style={styles.distanceItemContainer}>
              <Image source={TimeImage} style={styles.distanceItemImage} />
              <Text style={{ fontSize: 12, color: '#212121' }}>1h 10m</Text>
            </View>
            <View style={styles.distanceItemContainer}>
              <Image source={personImage} style={styles.distanceItemImage} />
              <Text style={{ fontSize: 12, color: '#212121' }}>4</Text>
            </View>
            <View style={styles.distanceItemContainer}>
              <DriverIcon style={styles.distanceItemImage} />
              <Text style={{ fontSize: 12, color: '#212121' }}>1</Text>
            </View>
          </View>
          <View style={styles.carDetailsContainer}>
            <View style={styles.profileImgContainer}>
              <Image style={styles.profileImg} source={ProfileImage} />
            </View>
            <View>
              <Text style={[styles.itemBoldText, {color: Colors.black}]}>TN 01 AB 1234</Text>
              <Text>Chevrolet Tavera</Text>
            </View>
            <View style={styles.carOTPContainer}>
              <View>
                <Image />
                <Text style={styles.itemBoldText}>OTP</Text>
              </View>
              <Text style={styles.itemBoldText}>123456</Text>
            </View>
          </View>
          <View style={styles.carDetailsContainer}>
            <View style={styles.profileImgContainer}>
              <Image style={styles.profileImg} source={ProfileImage} />
            </View>
            <View>
              <Text>Ezio Auditore</Text>
              <Text>9876543210</Text>
            </View>
            <View style={styles.personDetailsContainer}>
              <Image />
            </View>
          </View>
          <View style={[styles.locationDetails]}>
            <Image style={[styles.distanceItemImage, {height: 24, marginLeft: 10}]} source={EndLocationImage} />
            <View>
              <Text style={{color: '#757575', fontSize: 14}}>Office Location</Text>
              <Text style={{color: Colors.black}}>12, Kambar Street, OMR, Che...</Text>
            </View>
            <View style={[styles.carOTPContainer, {backgroundColor: '#2785ff', borderRadius: 20}]}>
              <Text style={styles.itemBoldText}>ETA</Text>
              <Text style={styles.itemBoldText}>1h 10m</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Location Details</Text>

          </View>
          <TripSummaryWaypoints waypoints={[{}, {}, {}, {}]} />
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={buttonStyles.buttonContainer}>
              <Image
                  source={HelpImage} // Replace with your image source
                  style={buttonStyles.buttonImage}
              />
              <Text style={buttonStyles.buttonText}>Helpline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[buttonStyles.buttonContainer, {backgroundColor: '#d85858'}]}>
              <Image
                  source={SosImage} // Replace with your image source
                  style={buttonStyles.buttonImage}
              />
              <Text style={[buttonStyles.buttonText, {color: 'white'}]}>SOS</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
    );
  }
}

export default TimelineTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  distanceContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    justifyContent: 'center',
    backgroundColor: '#fffad6', 
    borderRadius: 10,
    marginTop: 10
  },
  distanceItemContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 10,
    paddingRight: 10
  },
  distanceItemImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  carDetailsContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 10, 
    borderRadius: 10,
    marginTop: 10
  },
  profileImgContainer: {
    marginLeft: 8,
    height: 52,
    width: 52,
    borderRadius: 40
  },
  profileImg: {
    height: 50,
    width: 50,
    borderRadius: 40,
  },
  carOTPContainer: {
    backgroundColor: '#5347be',
    borderRadius: 10,
    padding: 10,
    width: 100,
    alignItems: 'center',
  },
  itemBoldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  personDetailsContainer: {
    backgroundColor: '#499875',
    borderRadius: 10,
    padding: 10
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    margin: 10
  },
  locationContainer: {
    alignItems: 'center',
  },
  locationTitle: {
    color: '#212121', 
    fontSize: 16, 
    fontWeight: '500', 
    borderBottomColor: '#212121', 
    borderBottomWidth: 1, 
    borderStyle: 'dashed'
  },
  sizeBox: {
    height: 100
  }
});
