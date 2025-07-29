import { Dimensions } from 'react-native';
import moment from 'moment';
import 'moment-timezone';
import locationTask from '../controllers/GetCurrentLocation';

const currentTimezone = moment.tz.guess();

export const { width } = Dimensions.get('window');
export const { height } = Dimensions.get('window');

export const utils = {
  getVehicleTypeImage: (type) => {
    if (type == '1') return require('../assets/image/vehicle/auto_left.png')
    else if (type == '2') return require('../assets/image/vehicle/bike_left.png')
    else if (type == '3') return require('../assets/image/vehicle/hatchback.png')
    else if (type == '4') return require('../assets/image/vehicle/sedan.png')
    else if (type == '5' || type == 'car') return require('../assets/image/vehicle/suv_left.png')
    else if (type == '6') return require('../assets/image/vehicle/luxsedan_left.png')
  },
  metersToKilometers(meters) {
    return meters / 1000;
   },
  getVehicleTypeLabel(type) {
    if (type == '1') return 'Auto'
    else if (type == '2') return 'BiKe'
    else if (type == '3') return 'Hatchback'
    else if (type == '4') return 'Sedan'
    else if (type == '5' || type == 'car') return 'SUV'
    else if (type == '6') return 'Luxury Sedan'

  },
  getEasyDate(duration) {

    let [start, end] = [undefined, undefined]

    // "2022-11-06T10:15"

    if (duration == 'tomorrow') {

      let date_Obj = new Date()
      let yyyy = date_Obj.getFullYear();
      let mm = date_Obj.getMonth() + 1;
      let dd = date_Obj.getDate() + 1;

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      start = ([yyyy, mm, dd].join('-')) + 'T00:00'
      end = ([yyyy, mm, dd].join('-')) + 'T23:59'
    }
    else if (duration == 'today') {

      let date_Obj = new Date()
      let yyyy = date_Obj.getFullYear();
      let mm = date_Obj.getMonth() + 1;
      let dd = date_Obj.getDate();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      start = ([yyyy, mm, dd].join('-')) + 'T00:00'
      end = ([yyyy, mm, dd].join('-')) + 'T23:59'
    }
    else if (duration == 'yesterday') {

      let date_Obj = new Date()
      let yyyy = date_Obj.getFullYear();
      let mm = date_Obj.getMonth() + 1;
      let dd = date_Obj.getDate() - 1;

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      start = ([yyyy, mm, dd].join('-')) + 'T00:00'
      end = ([yyyy, mm, dd].join('-')) + 'T23:59'
    }
    else if (duration == 'week') {

      let date_Obj = new Date()
      let firstday = new Date(date_Obj.setDate(date_Obj.getDate() - date_Obj.getDay()))
      let lastday = new Date(date_Obj.setDate(date_Obj.getDate() - date_Obj.getDay() + 6))

      {
        let yyyy = firstday.getFullYear();
        let mm = firstday.getMonth() + 1;
        let dd = firstday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        start = ([yyyy, mm, dd].join('-')) + 'T00:00'

      }
      {
        let yyyy = lastday.getFullYear();
        let mm = lastday.getMonth() + 1;
        let dd = lastday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        end = ([yyyy, mm, dd].join('-')) + 'T23:59'

      }
    }
    else if (duration == 'month') {

      let date_Obj = new Date()
      let firstday = new Date(date_Obj.getFullYear(), date_Obj.getMonth(), 1)
      let lastday = new Date(date_Obj.getFullYear(), date_Obj.getMonth() + 1, 0)

      {
        let yyyy = firstday.getFullYear();
        let mm = firstday.getMonth() + 1;
        let dd = firstday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        start = ([yyyy, mm, dd].join('-')) + 'T00:00'

      }
      {
        let yyyy = lastday.getFullYear();
        let mm = lastday.getMonth() + 1;
        let dd = lastday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        end = ([yyyy, mm, dd].join('-')) + 'T23:59'

      }
    }
    else if (duration == 'year') {

      let date_Obj = new Date()
      let firstday = new Date(date_Obj.getFullYear(), 0, 1)
      let lastday = new Date(date_Obj.getFullYear(), 12, 0)

      {
        let yyyy = firstday.getFullYear();
        let mm = firstday.getMonth() + 1;
        let dd = firstday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        start = ([yyyy, mm, dd].join('-')) + 'T00:00'

      }
      {
        let yyyy = lastday.getFullYear();
        let mm = lastday.getMonth() + 1;
        let dd = lastday.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        end = ([yyyy, mm, dd].join('-')) + 'T23:59'

      }
    }

    return { start, end }
  },
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
  formateDate: (date, seperator = '-') => {

    let dateObj = new Date(date);

    let dd = dateObj.getDate();
    let mm = dateObj.getMonth() + 1;
    let yyyy = dateObj.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return [dd, mm, yyyy].join(seperator);

  },
  getDateObj: (date) => {

    console.log(date, 'date');


    date = date || new Date();

    return new Date(date);
  },
  formateDateLabel: (ms) => {
    const date = new Date(ms);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const weekday = weekdays[date.getUTCDay()]
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = months[date.getUTCMonth()]
    const year = String(date.getUTCFullYear()).slice(-2)

    let hours = date.getUTCHours()
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12

    return `${weekday}, ${day} ${month} ${year} . ${hours}:${minutes} ${ampm}`
  },

  // function to conver seconds to X Hrs Y Mins or X Mins or X Hrs or X sec
  convertSecondsToReadable(seconds) {
    const hours = Math.floor(seconds / 3600);
    let minss = seconds % 3600;
    minss = parseInt(minss / 60);
    let secs = seconds % 60;
    secs = parseInt(secs);
    if (secs < 1) return `${hours} Hrs ${minss} Mins`;
    else if (hours < 1) return `${minss} Mins`;
    else return `${hours} Hrs ${minss} Mins`;
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

  currentMonthNameAndYear() {
    return moment().format('MMMM YYYY');
  },

  get90DaysAfterCurrentDate() {
    return moment().add(90, 'days').format('YYYY-MM-DD');
  },

  formatDate(dateString, format = 'DD MMM YYYY') {
    return moment(dateString).format(format || 'DD MMM YY');
  },

  formatDateAndTime(isoString) {
    isoString = isoString ? new Date(isoString) : new Date();
    return moment.tz(isoString, currentTimezone).format('LLL');
  },

  isToday(date) {
    return moment(date).isSame(new Date(), 'day');
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
    console.log("toTitleCase CALLED",str)
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
      const formattedDate = currentDate;
      daysList.push({
        index: i + 1,
        date: formattedDate,
        day: day,
        day_label: dayName,
        month: monthName,
        year: year,
      });
    }
    return daysList;
  },

  convertMinutesTo_HHMM(minutes) {
    const hours = Math.floor(minutes / 60);
    let minss = minutes % 60;
    minss = parseInt(minss);
    if (minss < 1) return `${hours} Hrs`;
    else if (hours < 1) return `${minss} Mins`;
    else return `${hours} Hrs ${minss} Mins`;
  },

  convertUTCtoComparisonAndDate(time) {
    // 2024-01-29T02:42:06.000Z to Today,Tomorrow or January 01
    const momentObj = moment(time);
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
    return [dateComparison, formattedTime];
  },

  formatAddressName: (address) => {
    if(address.locationFrom === "MAP"){
      return address.address.charAt(0).toUpperCase() + address.address.slice(1)
    }else if(address.locationFrom === "SEARCH"){
      return `${address.name},${address.address}`.charAt(0).toUpperCase() + `${address.name},${address.address}`.slice(1)
    }else{

      if (address.address){
        return address.address.charAt(0).toUpperCase() + address.address.slice(1)

      }
      else if(address.name){
        return address.name.charAt(0).toUpperCase() + address.name.slice(1)
      }
      else{
        return ""
      }
      
    }
  },

  formatISOToHumanReadable(isoString, format = 'DD MMM YYYY') {
    if (!isoString) return '';
    
    // Handle ISO date strings like "2025-12-31T00:00:00.000Z"
    const momentObj = moment(isoString);
    
    if (!momentObj.isValid()) {
      console.warn('Invalid ISO date string:', isoString);
      return '';
    }
    
    // Convert to local timezone and format
    return momentObj.tz(currentTimezone).format(format);
  },

  getTimeAfterMinutes(minutes) {
    if (!minutes || minutes < 0) {
      console.warn('Invalid minutes provided:', minutes);
      return '';
    }
    
    // Get current time and add the specified minutes
    const futureTime = moment().add(minutes, 'minutes');
    
    // Format as 12-hour time with AM/PM
    return futureTime.format('h:mm A');
  },

  formatMinutesToReadable(minutes) {
    if (!minutes || minutes < 0) {
      console.warn('Invalid minutes provided:', minutes);
      return '';
    }
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} hr`;
      } else {
        return `${hours} hr ${remainingMinutes} Min`;
      }
    } else {
      return `${minutes} Mins`;
    }
  },
  getBoundingBox(coordinates){
    console.log("gETBOUNDINGBOX CALLED")
    const minLat = Math.min(...coordinates.map(coord => coord[1]))
    const maxLat = Math.max(...coordinates.map(coord => coord[1]))
    const minLon = Math.min(...coordinates.map(coord => coord[0]))
    const maxLon = Math.max(...coordinates.map(coord => coord[0]))
    return [minLon, minLat, maxLon, maxLat]
  },

  /**
   * Get current user location
   * @returns {Promise<Array>} - Returns [longitude, latitude] or null if error
   */
  getCurrentUserLocation: async () => {
    try {
      const position = await locationTask.getCurrentLocation();
      if (position && position.coords) {
        return [position.coords.longitude, position.coords.latitude];
      }
      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },
};
