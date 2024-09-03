import React, {Component} from 'react';
import {ScrollView} from 'react-native';

// Modules

import MyAccountHeader from '../../Components/Profile/MyAccountHeader';
import MyAccountProfileImage from '../../Components/Profile/MyAccountProfileImage';
import MyAccountInfo from '../../Components/Profile/MyAccountInfo';
import SwipeBtn from '../../Controllers/CustomComponent/SwipeBtn';
import FullScreenLoader from '../../Components/Loaders/FullScreenLoader';
import {HomeScreenContext} from '../Home/HomeScreen';
import APIRequest from '../../Controllers/APIRequest';
import {GlobalContext} from '../Store/CreateStore';
import ApiConfig from '../../Config/ApiConfig';

// Images
import personImage from '../../Assets/account/person.webp';
import genderImage from '../../Assets/account/gender.webp';
import emailIcon from '../../Assets/account/email.webp';
import phoneIcon from '../../Assets/account/phone.webp';
import addressIcon from '../../Assets/account/location.webp';
import Logout from '../../Components/Authentication/Logout';
import CustomBackHandler from '../Home/RideNow/usebackbtn';

class MyAccount extends Component {
  constructor(props,globalContext) {
    super(props);
    this.state = {
      profileData: this.props.itemData,
    };

    this.globalContext = globalContext
    const { userDetails } = this.globalContext
    console.log(userDetails, 'userDetails')
    this.userId = userDetails.userInfo
  }

  async componentDidMount() {

    this.setState({loading: true});
    await this.fetchProfileData();
    this.setState({loading: false});
  }

  async fetchProfileData() {
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-profile-detials';

    let payload = {
      phone: this.userId,
    };

    console.log(payload, 'payload');

    try {
      let data = await api.request(url, 'POST', payload);
      data = data.data;
      this.setState({profileData: data});
    } catch (err) {
      console.log(err);
    }
  }

  getStats() {
    return [
      {
        name: 'Trips',
        value: this.state.profileData.trips_count,
      },
      {
        name: 'Duration',
        value: this.state.profileData.duration + ' Hrs',
      },
      {
        name: 'Distance',
        value: this.state.profileData.distance + ' Km',
      },
    ];
  }

  getInfo() {
    return [
      {
        key: 'Full Name',
        value: this.state.profileData ? this.state.profileData.name : '--',
        image: personImage,
      },
      // {
      //   key: 'Gender',
      //   value: this.state.profileData
      //     ? this.state.profileData.gender
      //     : '--',
      //   image: genderImage,
      // },
      {
        key: 'Phone Number',
        value: this.state.profileData ? this.state.profileData.id : '--',
        image: phoneIcon,
      },
      {
        key: 'Email Address',
        value: this.state.profileData
          ? this.state.profileData.email
          : '--',
        image: emailIcon,
      },
      {
        key: 'Address',
        value: this.state.profileData &&  this.state.profileData.employee_addressline_1 && this.state.profileData.employee_addressline_2
          ? this.state.profileData.employee_addressline_1 || '--' +
            '\n' +
            this.state.profileData.employee_addressline_2
          : '--',
        image: addressIcon,
      }, 
    ];
  }

  logout = async () => {
    let LogOut = new Logout();
    let response = await LogOut.logout();
    response ? this.props.navigation() : null;
  };

  handleDeviceBackPress(context) {
    context.changeScreen('Home');
  }

  render() {
    return (
      <HomeScreenContext.Consumer>
        {context => {
          return (
            <>
              {this.state.loading && <FullScreenLoader />}

              <ScrollView style={{backgroundColor: 'white'}}>
                <CustomBackHandler
                  onBackPress={() => this.handleDeviceBackPress(context)}
                />
                <MyAccountHeader
                  title="My Account"
                  onBackClick={() => context.changeScreen('Home')}
                />
                <MyAccountProfileImage
                  name={this.state.profileData?.name}
                  id={this.state.profileData?.employee_id}
                />
                {/* <MyAccountStats stats={this.getStats()} /> */}
                <MyAccountInfo infos={this.getInfo()} />
                <SwipeBtn
                  name="SWIPE TO LOGOUT"
                  onHandleSwipeEnd={() => this.logout()}
                />
              </ScrollView>
            </>
          );
        }}
      </HomeScreenContext.Consumer>
    );
  }
}

MyAccount.contextType = GlobalContext;
export default MyAccount;
