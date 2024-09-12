import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {colors, Fonts} from '../../constants/constants';
import {utils} from '../../utils/Utils';
import DatePicker from 'react-native-date-picker';
import useRideSelectionStore from '../../store/useRideSelectionStore';

const ScheduleContainer = () => {
  const fourteenDaysWithDayNames = utils.getNextDayLists(14);
  const {scheduleDateTime} = useRideSelectionStore();

  const [selectedDate, setSelectedDate] = useState('');

  const onSelectDate = item => {
    setSelectedDate(item);
  };

  const onDateChange = time => {
    console.log('hari-->>time-->>', time);
  };

  return (
    <View style={scheduleContainerStyles.container}>
      <Text style={scheduleContainerStyles.containerTitle}>
        Schedule a Trip
      </Text>
      <View style={scheduleContainerStyles.selectedDateContainer}>
        <Text style={scheduleContainerStyles.yearTxt}>
          {new Date(scheduleDateTime.selectedDate).toDateString()}
        </Text>
        <Text style={scheduleContainerStyles.timeTxt}>
          - {utils.timestampTo12HourFormat(scheduleDateTime.time)} -
        </Text>
      </View>
      <Text style={scheduleContainerStyles.yearTxt}>
        {utils.currentMonthNameAndYear()}
      </Text>
      <View>
        <ScrollView horizontal>
          {fourteenDaysWithDayNames.map(item => (
            <TouchableOpacity
              key={item.index}
              style={[
                scheduleContainerStyles.listCards,
                {
                  backgroundColor:
                    selectedDate.date === item.date
                      ? colors.violet
                      : colors.grey_xdark,
                },
              ]}
              onPress={() => onSelectDate(item)}>
              <Text
                style={[
                  scheduleContainerStyles.listCardsTxt,
                  {
                    color:
                      selectedDate.date === item.date
                        ? colors.white
                        : colors.black,
                  },
                ]}>
                {item.day}
              </Text>
              <Text
                style={[
                  scheduleContainerStyles.listCardsTxt,
                  {
                    color:
                      selectedDate.date === item.date
                        ? colors.white
                        : colors.black,
                  },
                ]}>
                {item.day_label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={scheduleContainerStyles.datePickerContainer}>
        <DatePicker
          mode="time"
          date={scheduleDateTime.time}
          is24hourSource="locale"
          onDateChange={onDateChange}
        />
      </View>
      <View style={scheduleContainerStyles.btnComponent}>
        <TouchableOpacity style={scheduleContainerStyles.confrmBtn}>
          <Text style={scheduleContainerStyles.confrmBtnTxt}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            scheduleContainerStyles.confrmBtn,
            {backgroundColor: colors.black},
          ]}>
          <Text
            style={[
              scheduleContainerStyles.confrmBtnTxt,
              {color: colors.white},
            ]}>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScheduleContainer;

const scheduleContainerStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    position: 'absolute',
    bottom: 0,
    zIndex: 6,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 10,
  },
  containerTitle: {
    fontFamily: Fonts.light,
    color: colors.black,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  selectedDateContainer: {
    width: '70%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.yellow_xxlight,
    marginTop: 15,
    borderRadius: 10,
    paddingBottom: 10,
  },
  yearTxt: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 16,
  },
  timeTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 12,
  },
  btnComponent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  confrmBtn: {
    width: '40%',
    backgroundColor: colors.grey_xdark,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confrmBtnTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 16,
  },
  listCards: {
    backgroundColor: colors.grey_xdark,
    marginHorizontal: 5,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    borderRadius: 15,
  },
  listCardsTxt: {
    fontFamily: Fonts.light,
    color: colors.black,
    fontSize: 14,
  },
  datePickerContainer: {
    backgroundColor: colors.white_dirt,
    marginVertical: 15,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
  },
});
