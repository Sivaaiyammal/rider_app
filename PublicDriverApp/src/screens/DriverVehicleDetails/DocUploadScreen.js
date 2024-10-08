import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBarA from '../../components/TopNavBar/NavBarA';
import {useNavigation} from '@react-navigation/native';
import DocWarning from '../../assets/image/svgIcons/docWarning.svg';
import {colors, Fonts} from '../../constants/constants';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {driverDetailStyles} from '../../styles/DriverDetailsUpload';
import DocUpload from '../../assets/image/svgIcons/docUpload.svg';

const DocUploadScreen = ({route}) => {
  const navigation = useNavigation();
  const doc = route.params.doc;

  const [image, setImage] = useState(null);

  const onBackPress = () => {
    navigation.goBack();
  };

  const handleChoosePhoto = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets) {
        console.log('ImagePicker: ', response);
        setImage(response);
      }
    });
  };

  // const handleTakePhoto = () => {
  //   launchCamera({mediaType: 'photo'}, response => {
  //     if (response.didCancel) {
  //       console.log('User cancelled camera picker');
  //     } else if (response.errorCode) {
  //       console.log('Camera Error: ', response.errorCode);
  //     } else if (response.assets) {
  //       setImage(response);
  //     }
  //   });
  // };

  return (
    <View style={driverDetailStyles.container}>
      <NavBarA
        onBackPress={onBackPress}
        title={'Upload'}
        subtitle={'Document Details'}
      />
      <View style={driverDetailStyles.infoContainer}>
        <View>
          <Text style={driverDetailStyles.infoText}>
            Format : JPG / PNG / PDF
          </Text>
          <Text style={driverDetailStyles.infoText}>
            Size : Maximum 1MB each
          </Text>
          <Text style={driverDetailStyles.infoText}>
            Resolution : Maximum 2000px
          </Text>
        </View>
        <DocWarning />
      </View>
      {image ? (
        <>
          <View style={driverDetailStyles.imageContainer}>
            <Image
              style={{width: '100%', aspectRatio: 1.5}}
              resizeMode="contain"
              source={{uri: image?.assets[0]?.uri}}
            />
          </View>
          <View style={driverDetailStyles.btnContainer}>
            <TouchableOpacity
              style={[
                driverDetailStyles.browseBtn,
                {backgroundColor: colors.blue_xxlight},
              ]}
              onPress={() => handleChoosePhoto()}>
              <Text
                style={[
                  driverDetailStyles.browseBtnTt,
                  {color: colors.violet},
                ]}>
                Change
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                driverDetailStyles.browseBtn,
                {backgroundColor: colors.orange_xxlight},
              ]}
              onPress={() => setImage(null)}>
              <Text
                style={[
                  driverDetailStyles.browseBtnTt,
                  {color: colors.danger_red},
                ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
        <View style={driverDetailStyles.imageuploadContainer}>
          <DocUpload />
          <Text style={driverDetailStyles.uploadText}>Upload</Text>
          <Text style={driverDetailStyles.uploadText}>{doc.name}</Text>
          <TouchableOpacity
            style={driverDetailStyles.browseBtn}
            onPress={() => handleChoosePhoto()}>
            <Text style={driverDetailStyles.browseBtnTt}>Browse</Text>
          </TouchableOpacity>
        </View>
           <View style={driverDetailStyles.infoContainer}>
           <View>
             <Text style={driverDetailStyles.infoText}>
               Upload Clear image of Registration Number, Blurry / Pixelated / Low
               Res / Invisibility will cause verification failed.
             </Text>
           </View>
         </View>
         </>
      )}
    </View>
  );
};

export default DocUploadScreen;
