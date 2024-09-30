import { StyleSheet } from 'react-native';
import { colors, Fonts } from '../constants/constants';
import { height } from '../utils/Utils';

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
    flexDirection:'row',
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
    // backgroundColor:'yellow'
  },
  draggableInput: {
    width: '86%',
    height: height * 0.06,
    marginLeft: 5,
    fontFamily: Fonts.medium,
    fontSize: 14,
    borderBottomWidth: 0.4,
    // backgroundColor:'red'
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
  rideSelectionContainer: {
    width: '96%',
    paddingVertical: 10,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center'
  },
  rideSelection: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    paddingVertical: 5
  },
  rideSelectionTxt: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 12
  },
  rideOptionContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    height: '100%',
    zIndex: 5
  },
  rideOptionBottom: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.white,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 10
  },
  tripSelectionBtn: {
    flexDirection: 'row',
    margin: 10,
    gap: 10,
    backgroundColor: colors.white_dirt,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tripSelectionBtnTxt: {
    fontFamily: Fonts.light,
    color: colors.black,
    fontSize: 16,
  },
  closeBtn: {
    paddingRight: 20,
    marginVertical: 10,
    alignSelf: 'flex-end',
    padding: 10,
    alignItems: 'center',
  },
  waypointsbtn:{
    alignSelf:'center', 
    width:'10%', 
  }
});

export const scheduleContainerStyles = StyleSheet.create({
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
    width: '20%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    width: '48%',
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
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    fontFamily: Fonts.light,
    color: colors.grey_xdark,
    fontSize: 14,
    alignItems: 'center',
  },
  priceDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
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
