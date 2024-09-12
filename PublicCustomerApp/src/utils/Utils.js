import { Dimensions } from 'react-native';
export const { width } = Dimensions.get('window');
export const { height } = Dimensions.get('window');

export const { Utils } = {

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
}