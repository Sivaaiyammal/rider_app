import { Dimensions } from 'react-native';
import moment from 'moment';
import 'moment-timezone';

export const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

const currentTimezone = moment.tz.guess();

export const utils = {

  dateToTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return strTime;
  },

  // function to conver seconds to X Hrs Y Mins or X Mins or X Hrs or X sec
  convertSecondsToReadable(seconds) {
    const hours = Math.floor(seconds / 3600);
    let minss = seconds % 3600;
    minss = parseInt(minss / 60)
    let secs = seconds % 60;
    secs = parseInt(secs)
    if (secs < 1) return `${hours} Hrs ${minss} Mins`
    else if (hours < 1) return `${minss} Mins`
    else return `${hours} Hrs ${minss} Mins`
  },

  formatISOTo12HourClock(dateString) {
    return moment.tz(dateString, currentTimezone).format('LT');
  },

  UTCFormat(dateString) {
    return moment.utc(dateString).format();
  },

  getCurrentDate() {
    return moment().format('YYYY-MM-DD');
  },

  currentDateAndTime() {
    return moment().format('LLLL'); // Wednesday, November 1, 2023 4:25 PM
  },

  get90DaysAfterCurrentDate() {
    return moment().add(90, 'days').format('YYYY-MM-DD');
  },

  formatDate(dateString) {
    return moment.tz(dateString, currentTimezone).format('LL');
  },

  formatDateAndTime(isoString) {
    return moment.tz(isoString, currentTimezone).format('LLL');
  },

  createUUID() {
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return pattern.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  timestampTo12HourFormat(timestamp) {
    return moment(timestamp).format('h.mm A');
  },

  toTitleCase: str => {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
  toTitleCaseName: str => {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
  },

  timestampTOISO(timestamp) {
    console.log('timestamp', timestamp);
    return moment(timestamp).format();
  },

  getNextDayLists(days) {
    const today = new Date();
    const daysList = [];
    for (let i = 0; i < days; i++) {
      const currentDate = moment(today).add(i, 'days');
      const dayName = currentDate.format('ddd');
      const monthName = currentDate.format('MMMM');
      const day = currentDate.format('DD');
      const year = currentDate.format('YYYY');
      const formattedDate = currentDate.format('YYYY-MM-DD');
      daysList.push({ index: i + 1, date: formattedDate, day: day, day_label: dayName, month: monthName, year: year });
    }
    return daysList;
  },

  convertMinutesTo_HHMM(minutes) {
    const hours = Math.floor(minutes / 60);
    let minss = minutes % 60;
    minss = parseInt(minss)
    if (minss < 1) return `${hours} Hrs`
    else if (hours < 1) return `${minss} Mins`
    else return `${hours} Hrs ${minss} Mins`
  },

  removeCountryCodeAndSpaces(phoneNumber) {

    var countryCodeAndSpacesPattern = /^(\+91\s?)?(\d[\s\d]*)$/;

    var cleanedNumber = phoneNumber.replace(countryCodeAndSpacesPattern, function (match, countryCode, digits) {
      return (countryCode ? countryCode : '') + digits.replace(/\s/g, '');
    });


    var countryCodePattern = /^(\+91\s?)?/;

    var cleanedNumber = cleanedNumber.replace(countryCodePattern, '');

    return cleanedNumber;
  },

  convertUTCtoComparisonAndDate(time) { // 2024-01-29T02:42:06.000Z to Today,Tomorrow or January 01 
    const momentObj = moment(time)
    const currentDate = moment();
    let dateComparison;
    if (momentObj.isSame(currentDate, 'day')) {
      dateComparison = 'Today';
    } else if (momentObj.isSame(currentDate.clone().add(1, 'day'), 'day')) {
      dateComparison = 'Tomorrow';
    } else {
      dateComparison = momentObj.format('MMMM DD');
    }
    const formattedTime = momentObj.format('h:mm a');
    return [dateComparison, formattedTime]
  },

   metersToKilometers(meters) {
    return meters / 1000;
   },
   
   secondsToReadableTime(seconds) {
    const duration = moment.duration(seconds, 'seconds');
    let result = '';

    if (duration.hours() > 0) {
        result += `${duration.hours()}hr `;
    }
    if (duration.minutes() > 0) {
        result += `${duration.minutes()}min `;
    }
    if (duration.seconds() > 0 || duration.asSeconds() === 0) {
        result += `${duration.seconds()}sec`;
    }

    return result.trim();
}

};

// module.exports = {
//   utils,
//   WINDOW_HEIGHT,
//   WINDOW_WIDTH,
// };
