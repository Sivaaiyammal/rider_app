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
    elevation:5
  },
  inputHeader: {
    width: '100%',
    top: 10,
    left: 20,
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:12
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
  searchResults:{
    fontFamily:Fonts.regular,
    color:colors.black,
    paddingVertical:8,
    borderBottomWidth:0.3
  }
});
