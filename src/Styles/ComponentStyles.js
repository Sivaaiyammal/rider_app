import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../Constants/Contants';
import {reponsiveFont} from '../Constants/Metrics';

export const componentStyle = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    width: '96%',
    alignSelf: 'center',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBox: {
    flexDirection: 'row',
    width: '86%',
    overflow: 'hidden',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 0.3,
  },
  input: {
    width: '74%',
  },
  inputIcons: {
    alignItems: 'center',
    width: '12%',
  },
  searchCancelBtn: {
    width: '12%',
    margin: 4,
    borderRadius: 40,
    borderWidth: 0.3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grey_xxlight,
    borderColor: Colors.grey,
  },
});

export const AddressCards = StyleSheet.create({
  cardContainer: {
    width: '95%',
    backgroundColor: '#fafafa',
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    margin: 8,
  },
  searchCancelBtn: {
    width: '14%',
    margin: 4,
    borderRadius: 40,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  m5: {
    marginLeft: 5,
  },
  cardViewAllBtn: {
    textAlign: 'center',
    marginVertical: 10,
    color: Colors.blue,
    fontSize: reponsiveFont(12),
    fontFamily: Fonts.light,
  },
  titleTxt: {
    fontFamily: Fonts.regular,
    fontSize: reponsiveFont(16),
    color: Colors.black,
  },
  addressTxt: {
    fontFamily: Fonts.light,
    fontSize: reponsiveFont(14),
    color: Colors.grey,
  },
  colorOrange: {
    color: Colors.orange,
  },
  cardTitle: {
    fontFamily: Fonts.regular,
    fontSize: reponsiveFont(16),
    color: Colors.black,
    marginBottom: 8,
  },
  flexRow: {
    flexDirection: 'row',
  },
  statusTxt: {
    fontFamily: Fonts.light,
    fontSize: reponsiveFont(12),
  },
  colorGreen: {
    color: Colors.green,
  },
  colorViolet: {
    color: Colors.violet,
  },
  resultName: {
    fontFamily: Fonts.light,
    fontSize: reponsiveFont(16),
    color: Colors.black,
  },
});
