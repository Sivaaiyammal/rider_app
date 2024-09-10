import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';
import {height} from '../utils/Utils';

export const addLocation = StyleSheet.create({
  container: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    alignSelf: 'center',
  },
  backButton: {
    width: '12%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    aspectRatio: 1,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addLocationContainer: {
    width: '95%',
    padding: 10,
    backgroundColor: colors.white,
    alignSelf: 'center',
    borderWidth: 0.4,
    borderRadius: 10,
    elevation: 5,
  },
  inputHeader: {
    width: '100%',
    top: 10,
    left: 20,
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 12,
  },
  draggableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  draggableInput: {
    width: '86%',
    height: height * 0.06,
    marginLeft: 5,
    fontFamily: Fonts.medium,
    fontSize: 14,
    borderBottomWidth: 0.4,
  },
  dragIcon: {
    position: 'absolute',
    right: 5,
  },
  searchResults: {
    fontFamily: Fonts.regular,
    color: colors.black,
    paddingVertical: 8,
    borderBottomWidth: 0.3,
  },
  confirmBtn: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: colors.blue_xxdark,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  confirmBtnTxt: {
    fontFamily: Fonts.medium,
    color: colors.white,
    fontSize: 12,
  },
});

export const vehicleList = StyleSheet.create({
  cards: {
    width: '90%',
    marginVertical: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 5,
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    width: '25%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    width: '50%',
    borderRightWidth: 0.3,
    marginVertical: 8,
  },

  vehicleName: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
  },
  vehicleDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
    marginTop: 10,
  },
  vehicleDetailsTxt: {
    fontFamily: Fonts.light,
    color: colors.grey_xdark,
    fontSize: 14,
    alignItems: 'center',
  },
  priceDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
  totalPrice: {
    fontFamily: Fonts.medium,
    fontSize: 24,
    color: colors.black,
  },
  discountPrice: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.grey_xdark,
  },
});
