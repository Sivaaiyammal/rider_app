import {Image, Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

import {RideNowTripsStyles} from '../../../../Styles/Home/RideNow';

import {utils} from '../../../../Controllers/utils';
import DatePicker from 'react-native-date-picker';
import TranslationFile from '../../../locales/TranslationFile';

export default class DateTimeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.translation = getRedirection(TranslationFile);
      }
    
  render() {
    return (
        <View style={[RideNowTripsStyles.dropdownContainer,{zIndex:10000}]}>
        <View
          style={[RideNowTripsStyles.dropdownContent, {height: 520}]}
          key={`dropdown-container`}>
          <Text style={RideNowTripsStyles.dropdownTitle}>{this.translation['schedule_a_trip']}</Text>
          <View style={RideNowTripsStyles.scheduleTripTodayContainer}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'black'}}>
              {this.props.scheduleTripDetials.date.month}{' '}
              {this.props.scheduleTripDetials.date.day},{' '}
              {this.props.scheduleTripDetials.date.year}
            </Text>
            <Text style={{fontSize: 13, fontWeight: 'normal', color: 'black'}}>
              -{' '}
              {utils.timestampTo12HourFormat(
                this.props.scheduleTripDetials.time,
              )}{' '}
              -
            </Text>
          </View>
          <View style={RideNowTripsStyles.scheduleTripDateContainer}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'black'}}>
              {this.props.scheduleTripDetials.date.month},{' '}
              {this.props.scheduleTripDetials.date.day}
            </Text>
            <ScrollView horizontal={true} style={{marginTop: 10}}>
              {this.props.scheduleSatesOptions?.map((date, di) => (
                <TouchableOpacity
                  key={`date-option-${di}`}
                  onPress={() => this.props.handleDateChange(date, di)}
                  style={[
                    RideNowTripsStyles.scheduleTripDateItem,
                    {
                      backgroundColor:
                        this.props.scheduleTripDetials.date.index == date.index
                          ? '#4b48ab'
                          : '#eeeeee',
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 14,
                      color:
                        this.props.scheduleTripDetials.date.index == date.index
                          ? 'white'
                          : 'black',
                    }}>
                    {date.day}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color:
                        this.props.scheduleTripDetials.date.index == date.index
                          ? 'white'
                          : 'black',
                    }}>
                    {date.day_label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <DatePicker
            mode="time"
            date={this.props.scheduleTripDetials.time}
            onDateChange={value => this.props.handleTimeChange(value)}
            minimumDate={this.props.isTodayDate ? new Date() : null}
          />
          <View style={RideNowTripsStyles.scheduleTripButtonsContainer}>
            <TouchableOpacity
              style={RideNowTripsStyles.scheduleTripButton}
              onPress={()=>this.props.handleCancel()}>
              <Text style={{color: 'black', fontSize: 15}}>{this.translation['cancel']}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                RideNowTripsStyles.scheduleTripButton,
                {backgroundColor: '#212121'},
              ]}
              onPress={()=>this.props.handleSubmit()}>
              <Text style={{color: 'white', fontSize: 15}}>{this.translation['confirm']}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    )
  }
}