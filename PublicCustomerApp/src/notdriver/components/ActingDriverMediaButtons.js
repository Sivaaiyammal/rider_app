import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts } from '../../common/constants/constants';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import useTripsStore from '../store/useTripsStore';

const ActingDriverMediaButtons = () => {
  const setStackScreen = useStackScreenStore(state => state.setStackScreen);
  const { preTripDone, postTripDone } = useActingDriverMediaStore();
  const { activeTripData } = useTripsStore();

  // Check server data as fallback when store is cleared
  const serverBills = activeTripData?.[0]?.bills;
  const preUploaded = preTripDone || !!(serverBills?.preTripVehiclePhotos?.front);
  const postUploaded = postTripDone || !!(serverBills?.postTripVehiclePhotos?.front);

  return (
    <>
     <Text style={styles.headerText}>Upload Photos and Bills</Text>
    <View style={styles.mediaUploadRow}>
      <TouchableOpacity
        style={[styles.mediaBtn, preUploaded && styles.mediaBtnDone]}
        onPress={() => setStackScreen('ActingDriverPreTripScreen')}
        activeOpacity={0.8}
      >
        <AntDesign
          name={preUploaded ? 'checkcircle' : 'pluscircleo'}
          size={18}
          color={preUploaded ? Colors.white : Colors.periwinkle}
        />
        <View style={styles.mediaBtnTexts}>
          <Text style={[styles.mediaBtnTitle, preUploaded && styles.mediaBtnTitleDone]}>
            Before Trip Photos
          </Text>
          <Text style={[styles.mediaBtnSub, preUploaded && styles.mediaBtnSubDone]}>
            {preUploaded ? 'Uploaded ✓' : 'Tap to upload 4 photos'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mediaBtn, postUploaded && styles.mediaBtnDone]}
        onPress={() => setStackScreen('ActingDriverPostTripScreen')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={postUploaded ? 'check-circle' : 'receipt'}
          size={18}
          color={postUploaded ? Colors.white : Colors.periwinkle}
        />
        <View style={styles.mediaBtnTexts}>
          <Text style={[styles.mediaBtnTitle, postUploaded && styles.mediaBtnTitleDone]}>
            After Photos & Bills
          </Text>
          <Text style={[styles.mediaBtnSub, postUploaded && styles.mediaBtnSubDone]}>
            {postUploaded ? 'Uploaded ✓' : 'Photos · expenses · receipts'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
      </>
  );
};

export default ActingDriverMediaButtons;

const styles = StyleSheet.create({
  mediaUploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 12,
    marginVertical: 10,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.periwinkle + '66',
    backgroundColor: '#F0F0FF',
  },
  mediaBtnDone: {
    backgroundColor: Colors.periwinkle,
    borderColor: Colors.periwinkle,
  },
  mediaBtnTexts: {
    flex: 1,
  },
  mediaBtnTitle: {
    fontSize: 12,
    fontFamily: Fonts.semi_bold,
    color: Colors.periwinkle,
  },
  mediaBtnTitleDone: {
    color: Colors.white,
  },
  mediaBtnSub: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.grey_dark,
    marginTop: 2,
  },
  mediaBtnSubDone: {
    color: 'rgba(255,255,255,0.85)',
  },
  headerText:{
    fontFamily  :Fonts.semi_bold,
    fontSize    :14,
    color       :Colors.black,
    marginLeft  :12,
    marginTop   :16
  }
});
