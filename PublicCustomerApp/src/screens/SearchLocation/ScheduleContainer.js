import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';
import {colors} from '../../constants/constants';
import {utils} from '../../utils/Utils';
import DatePicker from 'react-native-date-picker';
import useRideSelectionStore from '../../store/useRideSelectionStore';
import {scheduleContainerStyles} from '../../styles/AddLocationStyles';
import {showNotification} from '../../components/NotificationManger';

const ScheduleContainer = props => {
  const { t } = useTranslation();
  const {
    oncloseDateTime,
    onConfirmDateTime,
    isUpdate,
    scheduleTime,
    scheduleDate,
  } = props;
  const fourteenDaysWithDayNames = utils.getNextDayLists(14);
  const {setScheduleDateTime} = useRideSelectionStore();

  const filteredData = fourteenDaysWithDayNames.filter(item => {
    const itemDate = (
      typeof item.date === 'string' ? new Date(item.date) : item.date
    )
      .toISOString()
      .split('T')[0];
    return itemDate === scheduleDate;
  });

  const [selectedDate, setSelectedDate] = useState(
    isUpdate ? filteredData[0] : fourteenDaysWithDayNames[0],
  );
  const [selectedTime, setSelectedTime] = useState(
    isUpdate ? scheduleTime : new Date(),
  );

  const onSelectDate = item => {
    setSelectedDate(item);
  };

  const onDateChange = time => {
    setSelectedTime(time);
  };

  const onConfirm = () => {
    const _selectedTime = new Date(selectedTime);
    const currentTime = new Date();
    if (_selectedTime < currentTime) {
      showNotification(
        t('invalid_date_time'),
        t('please_select_time_greater'),
        'warning',
      );
    } else {
      setScheduleDateTime({date: selectedDate.date, time: selectedTime});
      onConfirmDateTime();
    }
  };

  const isToday = utils.isToday(selectedDate.date);
  const minTime = isToday ? new Date() : null;

  return (
    <View style={scheduleContainerStyles.container}>
      <Text style={scheduleContainerStyles.containerTitle}>
        {t('schedule_a_trip')}
      </Text>
      <View style={scheduleContainerStyles.selectedDateContainer}>
        <Text style={scheduleContainerStyles.yearTxt}>
          {new Date(selectedDate.date).toDateString()}
        </Text>
        <Text style={scheduleContainerStyles.timeTxt}>
          - {utils.timestampTo12HourFormat(selectedTime)} -
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
                    selectedDate.index === item.index
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
                      selectedDate.index === item.index
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
                      selectedDate.index === item.index
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
          date={selectedTime}
          is24hourSource="locale"
          onDateChange={onDateChange}
          minimumDate={minTime}
        />
      </View>
      <View style={scheduleContainerStyles.btnComponent}>
        <TouchableOpacity
          style={scheduleContainerStyles.confrmBtn}
          onPress={oncloseDateTime}>
          <Text style={scheduleContainerStyles.confrmBtnTxt}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            scheduleContainerStyles.confrmBtn,
            {backgroundColor: colors.black},
          ]}
          onPress={() => onConfirm()}>
                      <Text
              style={[
                scheduleContainerStyles.confrmBtnTxt,
                {color: colors.white},
              ]}>
              {t('confirm')}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScheduleContainer;
