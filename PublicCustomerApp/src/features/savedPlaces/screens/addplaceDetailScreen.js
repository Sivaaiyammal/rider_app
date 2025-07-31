import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import {utils} from '../../../utils/Utils';
import { Fonts } from '../../../constants/constants';
import useMapStore from '../../map/store/useMapStore';
import Marker from '../../../controllers/NEMap/Marker';
import useMapStyleStore from '../../../store/useMapStyleStore';
import {height } from '../../../utils/Utils'

const AddPlaceDetailScreen = ({ placeData, handleSavePlace, edit = false, existingLabel = '' }) => {
  const {goBack} = useStackScreenStore();
  const { setMapMarkers ,setMapLocation} = useMapStore();
  const [selectedOption, setSelectedOption] = useState(edit ? (existingLabel === 'home' || existingLabel === 'work' ? existingLabel : 'nickname') : 'nickname');
  const [nickname, setNickname] = useState(edit && existingLabel !== 'home' && existingLabel !== 'work' ? existingLabel : '');
  const {setMapStyle} = useMapStyleStore();

  // Get location data from route params
  const locationData = placeData;

  const saveOptions = [
    { key: 'home', label: 'Home',  },
    { key: 'work', label: 'Work', },
    { key: 'nickname', label: 'Other +' },
  ];

  useEffect(() => {
    if(selectedOption !== 'nickname'){
      setMapStyle({
        height: height*0.7,
        width:"100%",
      });
    }else{
      setMapStyle({
        height: height*0.6,
        width:"100%",
      });
    }
  }, [selectedOption]);

  // Add marker when component mounts
  useEffect(() => {
    if (placeData && placeData.latitude && placeData.longitude) {
      const marker = new Marker(
        'saved-place-marker',
        utils.formatAddressName(placeData),
        placeData.longitude,
        placeData.latitude,
        'saved-place',
        48,
        false,
        0
        
      );
      
      setMapMarkers([marker]);
      setMapLocation({lng:placeData.longitude,lat:placeData.latitude,zoom:25});
      setMapStyle({
        height: height*0.6,
        width:"100%",
      });
      // Cleanup function to remove marker when component unmounts
      return () => {
        setMapMarkers(null);
        setMapStyle({
          height:"100%",
          width:"100%",
        });
      };
    }
  }, [placeData, setMapMarkers]);

  const renderSaveOption = (option) => {
    const isSelected = selectedOption === option.key;
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.saveOptionButton,
          isSelected && styles.saveOptionButtonSelected,
        ]}
        onPress={() => setSelectedOption(option.key)}
      >
        <Text style={styles.saveOptionIcon}>{option.icon}</Text>
        <Text
          style={[
            styles.saveOptionText,
            isSelected && styles.saveOptionTextSelected,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handlePlaceSave = () => {
    const label = selectedOption === 'nickname' ? nickname : selectedOption;
    if(edit){
      handleSavePlace(locationData, label,placeData.favPlaceId);
    }else{
      handleSavePlace(locationData, label);
    }
  }

  // Check if save button should be disabled
  const isSaveDisabled = selectedOption === 'nickname' && !nickname.trim();

  return (
    <>
    <NavBar withBg={false} onBackPress={() => goBack()} title={edit ? 'Edit Place' : 'Add Place'} />
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>
            Address
        </Text>
        {/* Location Display */}
        <View style={styles.locationContainer}>
          <View style={styles.locationIcon}>
            <View style={styles.locationDot} />
          </View>
          <View style={styles.locationTextContainer}>
            
                <Text style={styles.locationTitle}>{utils.formatAddressName(locationData)}</Text>
           
          </View>
        </View>

        {/* Save As Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Save as</Text>
          <View style={styles.saveOptionsContainer}>
            {saveOptions.map(renderSaveOption)}
          </View>
        </View>

        {/* Nickname Input - Show only when nickname is selected */}
        {selectedOption === 'nickname' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter nickname for this place"
              value={nickname}
              onChangeText={setNickname}
              placeholderTextColor="#999"
            />
          </View>
        )}

        

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaveDisabled && styles.saveButtonDisabled
          ]}
          onPress={handlePlaceSave}
          disabled={isSaveDisabled}
        >
          <Text style={[
            styles.saveButtonText,
            isSaveDisabled && styles.saveButtonTextDisabled
          ]}>{edit ? 'UPDATE PLACE' : 'SAVE PLACE'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position:'absolute',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    elevation:10,
   left:0,
   right:0,
   bottom:0,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  locationContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5dc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
    marginBottom: 12,
    paddingLeft:10,
  },
  saveOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  saveOptionButtonSelected: {
    backgroundColor: 'black',
    borderColor: '#f5f5dc',
  },
  saveOptionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  saveOptionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
  },
  saveOptionTextSelected: {
    color: '#fff',
  },
  input: {
    fontFamily: Fonts.regular,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    backgroundColor: '#fafafa',
    minHeight: 48,

  },
  saveButton: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    fontFamily: Fonts.bold,
    marginTop: 10,
    
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
});

AddPlaceDetailScreen.propTypes = {
  placeData: PropTypes.object.isRequired,
  handleSavePlace: PropTypes.func.isRequired,
};

AddPlaceDetailScreen.defaultProps = {
  edit: false,
};

export default AddPlaceDetailScreen;
