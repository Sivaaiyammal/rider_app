import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  Linking,
} from 'react-native';
import React, {Component} from 'react';
import {Rating} from 'react-native-ratings';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';

import DurationIcon from '../../../Assets/HomeScreen/RideNow/time.png';
import HomeLocationIcon from '../../../Assets/HomeScreen/RideNow/homeLocation.png';
import DropLocationIcon from '../../../Assets/HomeScreen/RideNow/dropLocation.png';
import support_call from '../../../Assets/HomeScreen/RideNow/support_call.png';
import loc_completed from '../../../Assets/HomeScreen/RideNow/loc_completed.png';
import duration_completed from '../../../Assets/HomeScreen/RideNow/duration_completed.png';
import fare_completed from '../../../Assets/HomeScreen/RideNow/fare_completed.png';
import tick_white from '../../../Assets/HomeScreen/RideNow/tick_white.png';
import ProfileImage from '../../../Assets/HomeScreen/Profile.webp';
import totalfare_bg from '../../../Assets/HomeScreen/RideNow/totalfare_bg.png';
import payment_tag from '../../../Assets/HomeScreen/RideNow/payment_tag.png';
import {
  textStyle,
  img_iconStyle,
  commonStyles,
} from '../../../Styles/Home/RideNow';
import {TripSummaryStyle} from '../../../Styles/Trips/Summary';
import {SearchAPI} from '../../../Controllers/NEMap/Search';
import FullScreenLoader from '../../../Components/Loaders/FullScreenLoader';
import {GlobalContext} from '../../Store/CreateStore';
import NotificationManager from '../../../Components/Notification/NotificationManager';
import APIRequest from '../../../Controllers/APIRequest';
import ApiConfig from '../../../Config/ApiConfig';
import {utils} from '../../../Controllers/utils';
import TranslationFile from '../../locales/TranslationFile';

class StatusCompleted extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      isLoading: false,
      commentsTxt: '',
      ratings: 2.5,
    };

    this.searchAPI = new SearchAPI();

    this.globalContext = context;
    const {userDetails} = this.globalContext;
    this.userID = userDetails?.userInfo;

    this.translation = getRedirection(TranslationFile);
  }

  async updateDriverRating(rqstID) {
    this.setState({isLoading: true})
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/trip-ratings-update';

    let payload = {
      phone: this.userID,
      request_id: rqstID,
      feed_back: this.state.commentsTxt,
      rating: Number(this.state.ratings),
    };

    console.log('hari-->>updateDriverRating-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        console.log('hari-->>updateDriverRating-->>data-->>', data);
        if (data.success) {
          NotificationManager.success(data.message, 5000, 'bottom');
          this.setState({isLoading: false})
        }
      })
      .catch(
        e => (
          console.log('trip-->>updateDriverRating-->>ERROR-->>', e),
          NotificationManager.success('Error Updating Ratings', 5000, 'bottom'),
          this.setState({isLoading: false})
        ),
      )
      .finally(() => this.setState({isLoading: false}));
  }

  renderVerticalLines = count => {
    const verticalLines = [];
    for (let i = 0; i < count; i++) {
      verticalLines.push(
        <View
          key={i}
          style={[
            commonStyles.verticalLine,
            {width: 1, height: 6, backgroundColor: 'black'},
          ]}
        />,
      );
    }
    return verticalLines;
  };

  getHelp() {
    Linking.openURL(`tel:${9999999999}`).catch(err => {
      console.error('Failed to open phone dialer:', err);
    });
  }

  comments(name) {
    this.setState(
      prevState => ({
        ...prevState,
        commentsTxt: name,
      }),
      this.searchData,
    );
  }

  getPaymentType(value) {
    switch (value) {
      case 1:
        return 'Cash';
      case 2:
        return 'UPI';
      default:
    }
  }

  goHome(){
    this.props?.goHome()
  }

  render() {
    const items = this.props.itemData;
    const isHistory = this.props.isHistory;
    const request_id = this.props?.requestId;
    const startLocationName = this.props?.startLocationName;
    const endLocationName = this.props?.endLocationName;

    return (
      <ScrollView
        contentContainerStyle={{
          width: '94%',
          paddingBottom: 80,
          gap: 10,
          alignSelf: 'center',
          alignItems: 'center',
        }}>
        {this.state.isLoading && <FullScreenLoader message="Loading" />}
        {/* containerBlack  */}
        <View style={commonStyles.subContainerBlack}>
          <ImageBackground
            source={totalfare_bg}
            style={img_iconStyle.totalfare_bg}>
            <Text style={[textStyle.textnormal, {color: '#ffffff'}]}>
            {this.translation['ride_fare']}
            </Text>
            <Text style={[textStyle.textbold, {color: '#ffffff'}]}>
              ₹ {isHistory ? items?.estimatedfare : items?.estimate_fare}
            </Text>
          </ImageBackground>
        </View>

        {/* duration container */}
        <View style={commonStyles.timeContinaer}>
          {/* <Text style={textStyle.textnormal}>{items?.end_time}</Text> */}
          <Text style={textStyle.textsmall}>
            Trip ID: {isHistory ? items?.request_id : request_id}
          </Text>
        </View>

        {/* location Details */}
        <View style={[commonStyles.tripDetailsContainer]}>
          <Text
            style={[
              textStyle.textnormal,
              {borderBottomWidth: 1, borderStyle: 'dashed'},
            ]}>
            {this.translation['location_details']}
          </Text>
          <View
            style={[
              commonStyles.location,
              {backgroundColor: '#f5f5f5', marginTop: 10},
            ]}>
            <View style={commonStyles.locContent}>
              <Image style={img_iconStyle.locIcon} source={HomeLocationIcon} />
              <View>
                <Text style={textStyle.textsmall}>{this.translation['start_location']}</Text>
                <Text style={textStyle.textnormal}>Home</Text>
                <Text style={textStyle.textsmall}>
                  {isHistory ? items?.startLocationName : startLocationName}
                </Text>
              </View>
            </View>
            <View style={{position: 'absolute', left: 22, top: 40, gap: 4}}>
              {this.renderVerticalLines(5)}
            </View>

            <View style={commonStyles.locIconContainer}>
              <Image style={img_iconStyle.locIcon} source={DropLocationIcon} />
              <View>
                <Text style={textStyle.textsmall}>{this.translation['end_location']}</Text>
                <Text style={textStyle.textnormal}>Drop</Text>
                <Text style={textStyle.textsmall}>
                  {isHistory ? items?.endLocationName : endLocationName}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* tripdetails conatiner  */}
        <View style={commonStyles.tripDetailsContainer}>
          <Text
            style={[
              textStyle.textnormal,
              {borderBottomWidth: 1, borderStyle: 'dashed'},
            ]}>
            {this.translation['Trip_details']}
          </Text>
        </View>

        {/* driver_car Details */}
        <View style={commonStyles.carDriver_details}>
          <View style={commonStyles.conatinerRow}>
            <View
              style={[
                img_iconStyle.iconContainer_large,
                {width: '20%', alignItems: 'flex-start'},
              ]}>
              <Image
                style={[img_iconStyle.iconLarge, {width: '60%'}]}
                resizeMode="contain"
                source={ProfileImage}
              />
            </View>
            <View
              style={{
                gap: 5,
              }}>
              <Text style={textStyle.textbold}>
                {isHistory ? items?.driver_id : items?.name}
              </Text>

              <View style={commonStyles.conatinerRow}>
                <Image style={img_iconStyle.iconsmall} source={DurationIcon} />
                <Text commonStyles={textStyle.textsmall}>
                  {isHistory ? items?.driver_rating : items?.ratings}
                </Text>
              </View>
            </View>
          </View>
          <View style={commonStyles.conatinerRow}>
            <View
              style={[
                img_iconStyle.iconContainer_large,
                {width: '20%', alignItems: 'flex-start'},
              ]}>
              <Image
                style={[img_iconStyle.iconLarge, {width: '60%'}]}
                resizeMode="contain"
                source={ProfileImage}
              />
            </View>
            <View
              style={{
                gap: 5,
              }}>
              <Text style={textStyle.textbold}>
                {isHistory ? items?.vehicle_no : items?.vehicle_no}
              </Text>
              <Text commonStyles={textStyle.textsmall}>
                {isHistory ? items?.vehicle_details : items?.model}
              </Text>
            </View>
          </View>
        </View>

        {/* distance duration price conatiners  */}
        <View style={commonStyles.cardscontainer}>
          <View style={[commonStyles.cardSmall, {backgroundColor: '#e5f6ff'}]}>
            <Image style={img_iconStyle.iconsmall} source={loc_completed} />
            <Text style={textStyle.textsmall}>{this.translation['distance']}</Text>
            <Text style={textStyle.textnormal}>
              {isHistory ? items?.estimateddistance : items?.estimateddistance}
            </Text>
          </View>

          <View style={[commonStyles.cardSmall, {backgroundColor: '#fff5e5'}]}>
            <Image
              style={img_iconStyle.iconsmall}
              source={duration_completed}
            />
            <Text style={textStyle.textsmall}>{this.translation['duration']}</Text>
            <Text style={textStyle.textnormal}>
              {isHistory ? utils.convertSecondsToReadable(items?.estimatedduration) : utils.convertSecondsToReadable(items?.estimatedduration)}
            </Text>
          </View>

          <View style={[commonStyles.cardSmall, {backgroundColor: '#e7f5ee'}]}>
            <Image style={img_iconStyle.iconsmall} source={fare_completed} />
            <Text style={textStyle.textsmall}>Fare</Text>
            <Text style={textStyle.textnormal}>
              {isHistory ? items?.estimatedfare.toFixed(2) : items?.estimate_fare.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* payment Details  */}
        <View style={commonStyles.tripDetailsContainer}>
          <View style={commonStyles.priceDetails_container}>
            <Text
              style={[
                textStyle.textnormal,
                {borderBottomWidth: 1, borderStyle: 'dashed', color: '#495057'},
              ]}>
              {this.translation['feed_back']}
            </Text>
            <View style={commonStyles.priceDetails}>
              <Text style={[textStyle.textnormal, {color: '#495057'}]}>
              {this.translation['trip_bill']}
              </Text>
              <Text style={[textStyle.textnormal, {color: '#495057'}]}>
                ₹ {isHistory ? items?.estimatedfare : items?.estimate_fare}
              </Text>
            </View>
            <View style={commonStyles.priceDetails}>
              <Text style={[textStyle.textnormal, {color: '#495057'}]}>
                GST 18%
              </Text>
              <Text style={[textStyle.textnormal, {color: '#495057'}]}>
                ₹ {isHistory ? items?.estimatedfare : items?.estimate_fare}
              </Text>
            </View>
            <View style={commonStyles.priceDetails}>
              <Text style={[textStyle.textbold, {color: '#495057'}]}>
              {this.translation['trip_bill']}
              </Text>
              <Text style={[textStyle.textbold, {color: '#495057'}]}>
                ₹ {isHistory ? items?.estimatedfare : items?.estimate_fare}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              commonStyles.getHelpContainer,
              {backgroundColor: 'transparent', width: '100%', top: 15},
            ]}>
            <View style={{flexDirection: 'row'}}>
              <Image style={img_iconStyle.iconsmall} source={payment_tag} />
              <Text style={textStyle.textnormal}>{this.translation['payment_method']}</Text>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text style={[textStyle.textnormal, {color: '#189a76'}]}>
                {this.getPaymentType(items?.payment_type)}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* feedback */}
        <View style={[commonStyles.tripDetailsContainer, {}]}>
          <Text
            style={[
              textStyle.textnormal,
              {borderBottomWidth: 1, borderStyle: 'dashed'},
            ]}>
            {this.translation['feed_back']}
          </Text>
          <View style={[commonStyles.conatinerRow, {width: '100%'}]}>
            <View
              style={[
                img_iconStyle.iconContainer_large,
                {width: '20%', alignItems: 'flex-start'},
              ]}>
              <Image
                style={[img_iconStyle.iconLarge, {width: '60%'}]}
                resizeMode="contain"
                source={ProfileImage}
              />
            </View>
            <View
              style={{
                gap: 5,
              }}>
              <Text style={([textStyle.textnormal], {fontSize: 18})}>
                {isHistory ? items?.driver_id : items?.name}
              </Text>
            </View>
          </View>

          <View style={{width: '100%', marginTop: 10}}>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              onFinishRating={rating => {
                this.setState({ratings: rating});
                console.log('Rated:', rating);
              }}
            />
            <TextInput
              style={TripSummaryStyle.textArea}
              underlineColorAndroid="transparent"
              placeholder= {this.translation['comments']}
              placeholderTextColor="grey"
              numberOfLines={10}
              multiline={true}
              onChangeText={value => this.comments(value)}
            />
          </View>

          <View style={commonStyles.submitBtnContainer}>
            <TouchableOpacity
              style={commonStyles.submitButton}
              onPress={() => this.updateDriverRating(isHistory ?  items?.request_id : request_id)}>
              <Image style={img_iconStyle.iconsmall} source={tick_white} />
              <Text style={[textStyle.textnormal, {color: '#ffffff'}]}>
              {this.translation['submit']}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* get help  */}
        <TouchableOpacity
          style={commonStyles.getHelpContainer}
          onPress={() => this.getHelp()}>
          <Text style={textStyle.textnormal}>{this.translation['get_help_from_support']}</Text>
          <View style={img_iconStyle.iconContainer_large}>
            <Image
              style={[img_iconStyle.iconLarge, {width: '100%', height: 35}]}
              resizeMode="contain"
              source={support_call}
            />
          </View>
        </TouchableOpacity>

        {/* Home button  */}
        {!this.props.isHistory && (
          <TouchableOpacity style={commonStyles.homeBtn} onPress ={()=>this.goHome()}>
            <Text style={[textStyle.textnormal, {color: '#ffffff'}]}>{this.translation['home']}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }
}

StatusCompleted.contextType = GlobalContext;
export default StatusCompleted;

