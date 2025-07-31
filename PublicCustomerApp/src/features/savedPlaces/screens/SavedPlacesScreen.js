import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import { addFavoritePlace, deleteFavoritePlace } from '../../../API/EndPoints/EndPoints';
import { showNotification } from '../../../components/NotificationManger';
import useUserInfoStore from '../../../store/useUserInfoStore';
import { utils } from '../../../utils/Utils';
import { Fonts } from '../../../constants/constants';

const SavedPlacesScreen = () => {
  const {goBack,setStackScreen} = useStackScreenStore();
  const {userFavPlaces, setUserFavPlaces} = useUserInfoStore();

  
  const handleSavePlace = async (placeData,label) => {
    const payload = {
      locationData:placeData,
      label:label.toLowerCase()
    }
    try{
    const response = await addFavoritePlace(payload)
    console.log('response',response);
    if(response.success && response?.favPlaces?.length > 0){
      
      setUserFavPlaces(response?.favPlaces);
      
      showNotification('Success',response.message);
      goBack();
    }else{
      showNotification('Error',response.error);
    }
  }catch(error){
    showNotification('Error',error.message);
  }
  }

  const handleSearchCallback = (location) => {
    goBack();
    setStackScreen('AddPlaceDetailScreen',{
      placeData:location,
      edit:false,
      handleSavePlace:handleSavePlace
    });
  }

  const handleAddPlace = () => {
    setStackScreen('SearchScreen',{
      onSearchClick: handleSearchCallback,
      searchType:'savedPlaces'
    });
  };

  const handlePlacePress = (place) => {
    // Navigate to booking screen with the selected place as destination
    const locationData = place.locationData;
    const destinationData = {
      name: locationData.name || utils.formatAddressName(locationData),
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      type: 'DESTINATION_LOCATION',
      locationFrom: locationData.locationFrom || 'SAVED_PLACE'
    };
    
    setStackScreen('PlanRideScreen', {
      selectedDestination: destinationData
    });
  };

  const handleDeletePlace = async (placeToDelete) => {
    console.log('placeToDelete',placeToDelete);
    Alert.alert(
      'Delete Place',
      `Are you sure you want to delete "${placeToDelete.label}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const payload = {
                favPlaceId: placeToDelete.favPlaceId, // Use favPlaceId for deletion
               
              };
              console.log('payload',payload);
              
              const response = await deleteFavoritePlace(payload);
              console.log('response',response);
              if (response.success && response?.favPlaces) {
               
                setUserFavPlaces(response?.favPlaces);
                showNotification('Success', 'Place deleted successfully');
              } else {
                showNotification('Error', response.error || 'Failed to delete place');
              }
            } catch (error) {
              console.error('Error deleting place:', error);
              showNotification('Error', 'Failed to delete place. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditPlace = (placeToEdit) => {
    setStackScreen('AddPlaceDetailScreen', {
      placeData: {
        ...placeToEdit.locationData,
        originalLabel: placeToEdit.label,
        favPlaceId: placeToEdit.favPlaceId
      },
      edit: true,
      existingLabel: placeToEdit.label,
      handleSavePlace: handleUpdatePlace
    });
  };

  const handleUpdatePlace = async (placeData, newLabel,favPlaceId) => {
    console.log('placeData',placeData);
    try {
      
        const addPayload = {
          favPlaceId: favPlaceId,
          locationData: placeData,
          label: newLabel.toLowerCase()
        };
        
        const addResponse = await addFavoritePlace(addPayload);
        
        if (addResponse.success && addResponse?.favPlaces?.length > 0) {
          // Update local state using favPlaceId
          
          setUserFavPlaces(addResponse?.favPlaces);
          showNotification('Success', 'Place updated successfully');
          goBack();
        } else {
          showNotification('Error', addResponse.error || 'Failed to update place');
        }
      
    } catch (error) {
      console.error('Error updating place:', error);
      showNotification('Error', 'Failed to update place. Please try again.');
    }
  };

  const getPlaceIcon = (label) => {
    switch(label.toLowerCase()) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      default:
        return 'star';
    }
  };

  const renderSavedPlace = (place, index) => {
    console.log('place',place);
    const locationData = place.locationData;
    // const address = locationData.address || 'Unknown Address';
    //  const name = locationData.name || utils.formatAddressName(locationData);
    
    return (
      <TouchableOpacity 
        key={index} 
        style={styles.placeCard}
        onPress={() => handlePlacePress(place)}
        activeOpacity={0.7}
      >
        <View style={styles.placeIconContainer}>
          <Ionicons 
            name={getPlaceIcon(place.label)} 
            size={24} 
            color="#0f223c" 
          />
        </View>
        <View style={styles.placeContent}>
          <Text style={styles.placeLabel}>{place.label.charAt(0).toUpperCase() + place.label.slice(1)}</Text>
          
          <Text style={styles.placeFullAddress} numberOfLines={1} ellipsizeMode="tail">
            {utils.formatAddressName(locationData)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditPlace(place)}
          >
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeletePlace(place)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Saved Places</Text>
      <Text style={styles.emptySubtitle}>Your saved locations will appear here</Text>
      <Text style={styles.emptyDescription}>
        Tap the + button to add your first saved place
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userFavPlaces && userFavPlaces.length > 0 ? (
          <View style={styles.placesList}>
            {userFavPlaces.map((place, index) => renderSavedPlace(place, index))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddPlace}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  placesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  placeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeContent: {
    flex: 1,
    marginRight: 12,
  },
  placeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
    fontFamily: Fonts.medium,
  },
  placeAddress: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 2,
    fontFamily: Fonts.regular,
  },
  placeFullAddress: {
    fontSize: 12,
    color: '#757575',
    fontFamily: Fonts.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f223c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default SavedPlacesScreen; 