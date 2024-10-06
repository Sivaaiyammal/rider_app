import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBarA from '../../components/TopNavBar/NavBarA';
import {useNavigation} from '@react-navigation/native';
import DocWarning from '../../assets/image/svgIcons/docWarning.svg';
import {colors, Fonts} from '../../constants/constants';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const DocUploadScreen = ({route}) => {
  const navigation = useNavigation();
  const doc = route.params.doc;
  console.log('dic--', doc);

  const onBackPress = () => {
    navigation.goBack();
  };

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorCode);
        } else if (response.assets) {
            console.log('ImagePicker: ', response);
        }
        
    });
};

const handleTakePhoto = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
        if (response.didCancel) {
            console.log('User cancelled camera picker');
        } else if (response.errorCode) {
            console.log('Camera Error: ', response.errorCode);
        } else if (response.assets) {
            console.log('Camera: ', response);
        }
    });
};

  return (
    <View style={styles.container}>
      <NavBarA
        onBackPress={onBackPress}
        title={'Upload'}
        subtitle={'Document Details'}
      />
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.infoText}>Format : JPG / PNG / PDF</Text>
          <Text style={styles.infoText}>Size : Maximum 1MB each</Text>
          <Text style={styles.infoText}>Resolution : Maximum 2000px</Text>
        </View>
        <DocWarning />
      </View>
      <TouchableOpacity onPress={()=>handleChoosePhoto()}>
        <Text>Image Upload</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>handleTakePhoto()}>
        <Text>Image Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DocUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  infoContainer: {
    backgroundColor: colors.yellow_light,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
});
