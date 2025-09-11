import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Fonts } from '../../../constants/constants';
import HomeIcon from '../../../assets/icons/HomeIcon.svg';
import WorkIcon from '../../../assets/icons/WorkIcon.svg';
import FavIcon from '../../../assets/icons/FavIcon.svg';
import {  utils, width } from '../../../utils/Utils';
import useUserInfoStore from '../../../store/useUserInfoStore';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import AddFavIcon from '../../../assets/icons/AddFavIcon.svg';


const FavLabelItems = ({onLabelPress,enableAdd=true}) => {
  const { t } = useTranslation();
  const responsiveMaxWidth = width * 0.8;
  const {userFavPlaces} = useUserInfoStore();
  const {setStackScreen} = useStackScreenStore();

  const handleAddFavPlacePress = () => {
    setStackScreen('SavedPlacesScreen',{
      
    });
  }

  // Check if there are no favorite places
  const hasNoFavorites = !userFavPlaces || userFavPlaces.length === 0;

  
  return (
    <View style={styles.FavouriteAddressContainer}>  
      {hasNoFavorites && enableAdd ? (
        // Show "Add Favorite Places" only when no favorites exist
        <TouchableOpacity style={styles.FavouriteAddressItem} onPress={handleAddFavPlacePress}>
         
          <View style={styles.AddFavouriteAddressItemTextContainer}>
            <Text style={[styles.FavouriteAddressItemText,{color:"#757575"}]}>+ {t('add_favorite_places')}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        // Show existing favorites when they exist
        userFavPlaces?.map((item,index)=>(
          <TouchableOpacity key={index} style={styles.FavouriteAddressItem} onPress={()=>onLabelPress(item.label,item.locationData)}>
            <View style={styles.FavouriteAddressItemIcon}>
              {item.label.toLowerCase() === 'home' ? <HomeIcon width={50} height={50} /> : item.label.toLowerCase() === 'work' ? <WorkIcon width={50} height={50} /> : <View style={{paddingHorizontal:2}}><FavIcon width={45} height={45} /></View>  }
            </View>
           <View key={index} style={styles.FavouriteAddressItemTextContainer}>
           <Text style={styles.FavouriteAddressItemText}>{item.label}</Text>
           <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.FavouriteAddressItemSubText, { maxWidth: responsiveMaxWidth-5 }]}>{utils.formatAddressName(item.locationData)}</Text>
       </View>
       </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
   
    FavouriteAddressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
       
        paddingVertical: 0,
        borderRadius: 16,
       
      },
      noLocationItem: {
        gap: 10,
        
        backgroundColor: '#e0e0e0'+'50',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        
      },
      FavouriteAddressContainer:{
        gap: 20,
        marginTop: 20,
        paddingHorizontal: 10,
      
      },

      noLocation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 0,
        borderRadius: 16,
       
      },
      FavouriteAddressItemIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        
      },
      FavouriteAddressItemTextContainer: {
        gap: 5,
        paddingLeft: 5,
      },
      FavouriteAddressItemText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        textAlign: 'left',
        color: '#212121',
        textTransform: 'capitalize',
        
      },
      FavouriteAddressItemSubText: {
        fontFamily: Fonts.regular,
        fontSize: 13,
        color: '#757575',
        textAlign: 'left',
      },
      addLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
       
        paddingVertical: 0,
        borderRadius: 16,
        paddingHorizontal: 5,
       
      },
      addLocationText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color:"grey",
        textAlign: 'left',
      },
      AddFavouriteAddressItemTextContainer: {
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        padding:10,
        paddingVertical:10,
        marginHorizontal:5,
        borderRadius: 16,
        borderWidth:1,
        borderColor:"#757575",
        borderStyle:"dashed",
       
      },
});

export default FavLabelItems; 