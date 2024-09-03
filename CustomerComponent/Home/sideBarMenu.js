import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ProfileImage from '../../Assets/HomeScreen/Profile.webp';
import Icon from 'react-native-vector-icons/Ionicons';

class SideBarMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScreen: 'Home',
      profileData: this.props.itemData,
    };
  }

  componentDidUpdate(prevProps){
   if (prevProps.itemData !== this.props.itemData){
     this.setState({profileData: this.props.itemData})
     }
  }

  changeScreen = (title, clickEvt) => {
    this.setState({currentScreen: title});
    clickEvt();
  };

  TabButton = (index, title, imageProps, clickEvt) => {
    let currentScreen = this.state.currentScreen;

    return (
      <TouchableOpacity
        key={`item-${index}`}
        onPress={() => {
          if (title == 'LogOut') {
            // Do your Stuff...
          } else {
            this.changeScreen(title, clickEvt);
          }
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            backgroundColor: 'transparent',
            paddingLeft: 13,
            paddingRight: 35,
            borderRadius: 8,
            marginTop: 15,
          }}>
          <Icon
            name={imageProps}
            size={20}
            color={'black'}
          />

          <Text
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              paddingLeft: 15,
              color: 'black',
            }}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    // const {profileData} =  this.state.profileData
    return (
      <View style={{justifyContent: 'flex-start', padding: 15}}>
        <Image
          source={ProfileImage}
          style={{
            width: 60,
            height: 60,
            borderRadius: 10,
            marginTop: 8,
          }}></Image>

        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'black',
            marginTop: 20,
          }}>
          {this.state.profileData?.name}
        </Text>

        {/* <TouchableOpacity>
          <Text
            style={{
              marginTop: 6,
              color: 'black',
            }}>
            View Profile
          </Text>
        </TouchableOpacity> */}

        <View style={{flexGrow: 1, marginTop: 50}}>
          {
            // Tab Bar Buttons....
          }
          {this.props.menus?.map((item, index) => {
            return this.TabButton(
              index,
              item.title,
              item.imageProps,
              item.onPress,
            );
          })}
        </View>
      </View>
    );
  }
}

export default SideBarMenu;
