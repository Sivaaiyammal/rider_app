import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const WIDTH = width;
const HEIGHT = height;

console.log('MOBILE_DIMENSIONS-->>', WIDTH, HEIGHT);

const guidelineBaseWidth = 360;
const guidelineBaseHeight = 732;

const responsiveWidth = size => (width / guidelineBaseWidth) * size;
const responsiveHeight = size => (height / guidelineBaseHeight) * size;
const reponsiveFont = (size, factor = 0.5) =>
  size + (responsiveWidth(size) - size) * factor;

export {responsiveWidth, responsiveHeight, WIDTH, HEIGHT, reponsiveFont};
