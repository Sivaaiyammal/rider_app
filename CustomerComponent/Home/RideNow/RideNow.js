import React from 'react';
import {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  BackHandler,
  StyleSheet,
  Alert,
  NativeModules,
  DeviceEventEmitter,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

// Modules
import NEMap from '../../../Components/Native/NEMap';
import MultiStopStartEndLocation from '../../../Components/Trips/MultiStopStartEndLocation';
import {HomeScreenContext} from '../HomeScreen';
import Header from './Header';
import Marker from '../../../Controllers/NEMap/Marker';
import {DirectionAPI} from '../../../Controllers/NEMap/Directions';
import {utils} from '../../../Controllers/utils';
import {WINDOW_HEIGHT} from '../../../Controllers/utils.js';
import GetDriverDetails from './GetDriverDetails';
import DraggableBottomSheet from '../../../Controllers/CustomComponent/BottomSheet';
import CustomBackHandler from './usebackbtn.js';
import PaymentMethodDetails from './paymentScreen.js';

// Styles
import {RideNowTripsStyles} from '../../../Styles/Home/RideNow';
import {buttonStyles} from '../../../Styles/Home/Home';
import {
  bottomSheetView,
  commonStyles,
  textStyle,
} from '../../../Styles/Home/RideNow';
// react-native-upi-gateway
// import {RNUpiPayment} from 'react-native-upi-gateway';

// images
import LocateOnMap from '../../../Assets/locateonmap.webp';
import FullScreenLoader from '../../../Components/Loaders/FullScreenLoader';
import OnewayTripIcon from '../../../Assets/HomeScreen/RideNow/oneway.png';
import RoundTripIcon from '../../../Assets/HomeScreen/RideNow/roundtrip.png';
import MultistopsTripIcon from '../../../Assets/HomeScreen/RideNow/multistops.png';
import SelectedVehicleInfo from './SelectedVehicleInfo';
import VehicleSearchLoader from '../VehicleSearchLoader';
import APIRequest from '../../../Controllers/APIRequest';
import NotificationManager from '../../../Components/Notification/NotificationManager';
import MainMenuContainer from '../MainMenuContainer.js';
import LocationInfo from '../../../Components/Home/LocationInfo.js';
import MapIcons from '../../../Components/Home/MapIcons.js';
import {GlobalContext} from '../../Store/CreateStore.js';
import VehicleList from './VehicleList.js';
import ApiConfig from '../../../Config/ApiConfig.js';
import RideTypeButton from './SelectRideType/RideTypeButton.js';
import RideTypeModal from './SelectRideType/RideTypeModal.js';
import DateTimeModal from './SelectRideType/DateTimeModal.js';
import NotificationAlert from '../../../Controllers/NotificationAlert.js';
import RadioButton from '../../../Controllers/CustomComponent/RadioButton.js';
import CustomModal from '../../../Controllers/CustomComponent/CustomModal.js';
import StatusCompleted from './StatusCompleted.js';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../locales/TranslationFile.js';

const {NeNativeModule} = NativeModules;

class InstantTrips extends Component {
  constructor(props, context) {
    super(props);

    const fourteenDaysWithDayNames = utils.getNextDayLists(14);

    this.pickupTypeOptions = [
      {
        id: '1',
        title: 'Pickup Now',
        value: 'pickupnow',
        isIcon: true,
        icon: OnewayTripIcon,
        screenType: 'RideNow',
      },
      {
        id: '2',
        title: 'Schedule',
        value: 'schedule',
        isIcon: true,
        icon: OnewayTripIcon,
        screenType: 'Schedule',
      },
    ];
    this.tripTypeOptions = [
      {
        id: '1',
        title: 'One Way',
        value: 'one_way',
        isIcon: true,
        icon: OnewayTripIcon,
      },
      {
        id: '3',
        title: 'Round Trip',
        value: 'round_trip',
        isIcon: true,
        icon: RoundTripIcon,
      },
      {
        id: '2',
        title: 'Multi Stop',
        value: 'multi_stop',
        isIcon: true,
        icon: MultistopsTripIcon,
      },
    ];

    this.paymentTypeOptions = [
      {
        id: '1',
        title: 'Cash',
        value: 'cash',
        isIcon: true,
        isEnabled: true,
      },
      {
        id: '2',
        title: 'UPI',
        value: 'upi',
        isIcon: true,
        isEnabled: true,
      },
    ];

    this.scheduleSatesOptions = fourteenDaysWithDayNames;

    this.state = {
      searchingForVehicleFares: false,
      searchedVehicleFaresList: [],
      showBottomView: true,
      screenType: 'home',
      selectedVehicleFare: false,
      isSearchingVehicle: false,
      isVehicleFound: undefined,
      startLocationMarker: null,
      waypointLocationMarkers: [],
      endLocationMarker: null,
      startLocationName: '',
      endLocationName: '',
      mapHandlerAdded: false,
      routeFound: false,
      route: null,
      showFullScreenLoader: false,
      showTopSelectOptionType: null,
      showScheduleTripTimeOption: false,
      isBooked: false,
      scheduleTripDetials: {
        date: this.scheduleSatesOptions[0],
        time: new Date(),
      },

      isLoadingSearchModal: false,

      selectedPickupType: this.pickupTypeOptions[0] || undefined,
      selectedTripType: this.tripTypeOptions[0] || undefined,

      selectedRideType: this.pickupTypeOptions,
      selectedPaymentMethod: '2',
      isUpdateDate: false,
      booking_details_data: undefined,
      booking_details_live_data: undefined,
      booking_loader: false,
      mapFindRoute: null,
      selectedVehicleZindex: true,
      startNavigation: false,
      ridenow_rqstId: undefined,
      ispaymentModalOpen: false,
      paymentMsg: undefined,
      profileData: undefined,
      showSummary: false,
      driverMarkers: [],
      showSearchModal: false,
      translateY: new Animated.Value(500),
    };

    this.translation = getRedirection(TranslationFile);

    this.mapClickHandler = undefined;
    this.directionAPI = new DirectionAPI();
    this.confirmBtnClickHandler = this.confirmBtnClickHandler.bind(this);
    this.setStartLocationName = this.setStartLocationName.bind(this);
    this.setWaypointLocations = this.setWaypointLocations.bind(this);
    this.setEndLocationName = this.setEndLocationName.bind(this);
    this.setMapClickHandler = this.setMapClickHandler.bind(this);
    this.updateMapLoaded = this.updateMapLoaded.bind(this);

    const {showMenu} = this.props;
    this.scaleValue = new Animated.Value(showMenu ? 0.78 : 1);
    this.offsetValue = new Animated.Value(showMenu ? 350 : 0);
    this.closeButtonOffset = new Animated.Value(showMenu ? -30 : 0);

    this.requestDetailsTimer = undefined;
    this.globalContext = context;
    const {userDetails} = this.globalContext;
    this.userID = userDetails?.userInfo;

    this.userDetails = this.props.itemData;
  }

  componentDidMount() {
    // this.attachedScoketListeners();
    console.log('hari-->>componentDidMount-->>RN');
    const {socket, isSocketInitialized} = this.globalContext.getSocket();

    socket.emit('server_listner', {
      message: 'CUSTOMER INIT',
      app_id: 'customer',
      event: 'CUSTOMER_INIT',
      customer_id: this.userID,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showMenu !== this.props.showMenu) {
      Animated.parallel([
        Animated.timing(this.scaleValue, {
          toValue: this.props.showMenu ? 0.78 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.offsetValue, {
          toValue: this.props.showMenu ? 350 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.closeButtonOffset, {
          toValue: this.props.showMenu ? -30 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (prevProps.itemData !== this.props.itemData) {
      this.userDetails = this.props.itemData;
    }
    this.props.hideTabBar(this.state.screenType);
  }

  setStartLocationName(name, location) {
    if (name === null) {
      this.setState(prevState => ({
        ...prevState,
        startLocationMarker: null,
        startLocationName: '',
        routeFound: false,
        route: null,
        mapFindRoute: null,
      }));
    } else {
      let [longitude, latitude] = location;
      let marker = new Marker(
        String(new Date().getTime()),
        'start',
        longitude,
        latitude,
      );
      this.setState(
        prevState => ({
          ...prevState,
          startLocationMarker: marker,
          startLocationName: name,
          routeFound: false,
          route: null,
        }),
        () => this.setRoute(),
      );
      Animated.timing(this.state.translateY, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        this.setState({showSearchModal: false});
      });
    }
  }

  setWaypointLocations(waypoints, showBG) {
    const hasCoordinates = waypoints.every(item =>
      item.hasOwnProperty('coordinates'),
    );
    if (hasCoordinates) {
      if (!Array.isArray(waypoints) || !waypoints.length) return;
      let waypoints_markers = waypoints.map((waypoint, i) => {
        if (waypoint?.coordinates && waypoint?.locationName) {
          return new Marker(
            String(new Date().getTime()),
            waypoint?.locationName,
            waypoint?.coordinates[0],
            waypoint?.coordinates[1],
            'start',
          );
        }
      });

      this.setState(
        prevState => ({
          ...prevState,
          waypointLocationMarkers: waypoints_markers,
          routeFound: false,
          route: null,
        }),
        () => this.setRoute(),
      );
      if (!showBG) {
        Animated.timing(this.state.translateY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          this.setState({showSearchModal: false});
        });
      }
    }
  }

  setEndLocationName(name, location) {
    if (name === null) {
      this.setState(prevState => ({
        ...prevState,
        endLocationMarker: null,
        endLocationName: '',
        routeFound: false,
        route: null,
        mapFindRoute: null,
      }));
    } else {
      let [longitude, latitude] = location;
      let marker = new Marker(
        String(new Date().getTime()),
        'end',
        longitude,
        latitude,
      );
      this.setState(
        prevState => ({
          ...prevState,
          endLocationMarker: marker,
          endLocationName: name,
          routeFound: false,
          route: null,
        }),
        () => this.setRoute(),
      );
      Animated.timing(this.state.translateY, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        this.setState({showSearchModal: false});
      });
    }
  }

  getDirectionPoints = data => {
    let locations = [];

    data.forEach(d => {
      locations.push({
        lat: d[1],
        lon: d[0],
      });
    });

    return locations;
  };

  async setRoute() {
    if (this.state.startLocationMarker && this.state.endLocationMarker) {
      let startLocation = [
        this.state.startLocationMarker.lng,
        this.state.startLocationMarker.lat,
      ];
      let endLocation = [
        this.state.endLocationMarker.lng,
        this.state.endLocationMarker.lat,
      ];

      let wayPoints = this.state.waypointLocationMarkers.map(marker => [
        marker?.lng,
        marker?.lat,
      ]);

      let locations = this.getDirectionPoints([
        startLocation,
        ...wayPoints,
        endLocation,
      ]);

      console.log(locations, 'LOCATIONS');
      this.setState({
        mapFindRoute: locations,
        showFullScreenLoader: true,
      });
      return;
    }
  }

  updateMapLoaded = () => {
    console.log('hari-->>rideNow-->>mapLoaded');
  };

  setMapClickHandler(handler) {
    this.mapClickHandler = handler;
    this.setState(prevState => ({
      ...prevState,
      mapHandlerAdded: true,
    }));
  }

  async getTripEstimate() {
    this.setState({showFullScreenLoader: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-trip-estimate';

    const waypoints = this.state.waypointLocationMarkers.map(item => ({
      lat: item.lat,
      lon: item.lng,
    }));

    let payload = {
      phone: this.userID,
      trip_type: this.state.selectedTripType.id,
      startLocation: {
        lat: this.state.startLocationMarker.lat,
        lon: this.state.startLocationMarker.lng,
      },
      endLocation: {
        lat: this.state.endLocationMarker.lat,
        lon: this.state.endLocationMarker.lng,
      },
      waypoints: waypoints,
    };
    console.log('hari-->>getTripEstimate-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          console.log('hari-->>data-->>getTripEstimate-->>', data);
          this.setState(prevState => ({
            ...prevState,
            searchedVehicleFaresList: data.data.trip,
            searchingForVehicleFares: true,
            mapHandlerAdded: false,
          }));
          NotificationManager.success(data.message, 5000, 'bottom');
          console.log('hari-->>data-->>getTripEstimate-->>', data);
        } else {
          NotificationManager.success(data.message, 5000, 'bottom');
        }
      })
      .catch(
        e => (
          console.log('trip-->>getTripEstimate-->>ERROR-->>', e),
          NotificationManager.success(
            'Unable to Fetch Vehicles at the moment',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async getRequestDetails(rqstId, type) {
    this.setState({showFullScreenLoader: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-request-details';

    let payload = {
      phone: this.userID,
      request_id: rqstId,
    };

    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          this.setState({booking_details_data: data.data});

          // AJIN
          // alert('YES');

          if (type === 'Schedule') {
            this.setState({
              isSearchingVehicle: false,
              // selectedVehicleFare: data.data,
              searchingForVehicleFares: false,
              isBooked: true,
            });
          } else {
            this.setState({isSearchingVehicle: false});
            this.setState({screenType: 'Schedule'});
            this.setState({isVehicleFound: data.data});
          }
        }
      })
      .catch(
        e => (
          console.log('trip-->>getRequestDetails-->>ERROR-->>', e),
          NotificationManager.success(
            'Unable to Fetch Booking Details',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async getNearByDrivers(type) {
    this.setState({showFullScreenLoader: true});
    const {mapInitialLocation} = this.props;
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-drivers-nearme';

    let payload = {
      phone: this.userID,
      location: {
        lat: mapInitialLocation?.lat,
        lon: mapInitialLocation?.lng,
      },
    };

    console.log('hari-->>getNearByDrivers-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          const waypoinddts = data.data.map((item, i) => {
            if (item?.lat !== null && item.lon !== null) {
              return new Marker(
                String(new Date().getTime()),
                'drivers',
                item.lon,
                item.lat,
                'start',
              );
            }
          });
          this.setState(prevState => ({
            ...prevState,
            driverMarkers: waypoinddts,
            routeFound: false,
            route: null,
          }));
        }
      })
      .catch(
        e => (
          console.log('trip-->>getNearByDrivers-->>ERROR-->>', e),
          NotificationManager.success(
            'Error Fetching NearBy Drivers',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async ConfirmBookingapiRequest() {
    this.setState({showFullScreenLoader: true});

    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/create-request';

    const date = new Date(
      this.state.scheduleTripDetials.date.date,
    ).toDateString();
    const time = this.state.scheduleTripDetials.time.toLocaleTimeString();
    const milliseconds = new Date(date + ' ' + time).getTime();
    const currentDate = new Date();

    const providedDate = new Date(milliseconds);
    if (this.state.screenType === 'Schedule') {
      if (providedDate < currentDate) {
        this.setState({showFullScreenLoader: false});
        return Alert.alert(
          'Scheduled start times should be greater than the current time.',
        );
      }
    }

    console.log('hari-->>milliseconds-->>', milliseconds);
    const waypoints = this.state.waypointLocationMarkers.map(item => ({
      lat: item.lat,
      lon: item.lng,
    }));
    console.log('tested', this.state.selectedPaymentMethod);
    if (this.state.selectedPaymentMethod === '2') {
      if (
        this.state.booking_details_data?.payment_details?.wallet_balance <
        this.state.booking_details_data?.payment_details?.total_price
      ) {
        NotificationManager.error(
          'Insufficient Wallet Balance',
          5000,
          'bottom',
        );
        this.setState({showFullScreenLoader: false});
        return false;
      }
    }

    let payload = {
      name: this.userDetails.name || 'Raja',
      phone: this.userID,
      trip_type: this.state.selectedTripType.id,
      vehicle_type: this.state.selectedVehicleFare.type,
      pickuptime: milliseconds.toString(),
      // pickup_type: '2', // this.state.screenType === 'RideNow' ? '1' : '2',
      payment_type: this.state.selectedPaymentMethod,
      startLocation: {
        lat: this.state.startLocationMarker.lat,
        lon: this.state.startLocationMarker.lng,
        // address:this.state.startLocationName
      },
      endLocation: {
        lat: this.state.endLocationMarker.lat,
        lon: this.state.endLocationMarker.lng,
        // address:this.state.endLocationName
      },
      waypoints: waypoints,
    };
    console.log('hari-->>ConfirmBookingapiRequest-->>payload-->>', payload);

    await api
      .request(url, 'POST', payload)
      .then(data => {
        console.log('hari-->>ConfirmBookingapiRequest-->>data-->>', data);
        if (data.success) {
          NotificationManager.success(data.message, 5000, 'bottom');
          if (data.data.request_id) {
            if (this.state.screenType === 'RideNow') {
              this.setState({
                selectedVehicleFare: false,
                isSearchingVehicle: true,
                ridenow_rqstId: data.data.request_id,
                isBooked: true,
              });
              this.emitRequest(data.data.request_id);
            } else {
              this.getRequestDetails(
                data.data.request_id,
                this.state.screenType,
              );
            }
          }
        } else {
          NotificationManager.error(data.message, 5000, 'bottom');
        }
      })
      .catch(
        e => (
          console.log('hari-->>ConfirmBookingapiRequest-->>ERROR-->>', e),
          NotificationManager.success(
            'ServerConnectionError - Cannot Book Ride',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async paymentApi(transID) {
    this.setState({showFullScreenLoader: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-drivers-nearme';

    let payload = {
      phone: this.userID,
      request_id:
        this.state.screenType === 'RideNow'
          ? this.state.ridenow_rqstId
          : this.state.booking_details_data.request_id,
      payment_transaction_id: transID,
    };

    console.log('hari-->>paymentApi-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          this.setState({
            ispaymentModalOpen: true,
            paymentMsg: 'Transaction SuccessFull',
            showSummary: true,
            startNavigation: false,
            isVehicleFound: false,
          });
        } else {
          this.setState({
            ispaymentModalOpen: true,
            paymentMsg: 'Error Updating Payment Status',
          });
        }
      })
      .catch(
        e => (
          console.log('trip-->>paymentApi-->>ERROR-->>', e),
          NotificationManager.success(
            'Payment Failed - while Updating Payment Status',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async emitRequest(reqId) {
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/driver/test_trip_info_socket_update';

    const payload = {
      request_id: reqId,
      driver_id: '7904491410',
    };

    await api
      .request(url, 'POST', payload)
      .then(data => {
        console.log('hari-->>ConfirmBookingapiRequest-->>', data);
        if (data.status) {
          NotificationManager.success(data.message, 5000, 'bottom');
          this.attachedScoketListeners();
        } else {
          NotificationManager.error(data.message, 5000, 'bottom');
        }
      })
      .catch(e =>
        console.log('hari-->>ConfirmBookingapiRequest-->>emit-->>ERROR-->>', e),
      );
  }

  attachedScoketListeners = () => {
    const {socket, isSocketInitialized} = this.globalContext.getSocket();

    console.log('hari-->>socket-->>', 'sjdfhjsdhfj');

    socket.on('DRIVER_LIVE_INFO_TO_CUSTOMER', async data => {
      console.log('hari-->>driver_accepted-->>', data.data);
      if (data.data.get_driver_result) {
        if (
          this.state.startLocationMarker == null &&
          this.state.endLocationMarker == null
        ) {
          this.setState({
            screenType: 'RideNow',
            showBottomView: false,
            // isVehicleFound: true,
          });
          this.setStartLocationName('start', [
            data.data.get_driver_result.start_location.y,
            data.data.get_driver_result.start_location.x,
          ]);
          await this.setEndLocationName('end', [
            data.data.get_driver_result.end_location.y,
            data.data.get_driver_result.end_location.x,
          ]);

          // await this.delay(5000);
        }

        this.setState({
          isSearchingVehicle: false,
          isVehicleFound:
            data.data.get_driver_result.status == '3' &&
            data.data.get_driver_result.payment_status == '1'
              ? false
              : true,
          booking_details_data: data.data,
          showFullScreenLoader:
            data.data.get_driver_result.payment_status == '1' ? false : false,
          startNavigation:
            data.data.get_driver_result.status == '2' && this.state.routeFound
              ? true
              : false,
          showSummary:
            data.data.get_driver_result.status == '3' &&
            data.data.get_driver_result.payment_status == '1'
              ? true
              : false,
        });

        if (data.data.get_driver_result.status == '3') {
          this.endNavigation();
        }

        this.process = setInterval(() => {
          console.log('hari-->>driver_accepted-->>', 'process');
          if (
            this.state.booking_details_data?.get_driver_result?.status == '2' &&
            this.state.routeFound
          ) {
            this.setState({
              startNavigation: true,
              showFullScreenLoader: false,
            });
            console.log('hari-->>driver_accepted-->>', 'clear');
            clearInterval(this.process);
          }
        }, 100);
      }
      //  else {
      //   NotificationManager.error('Something Went Wrong', 5000, 'bottom');
      // }
    });

    socket.on('DRIVER_LIVE_LOCATION_TO_CUSTOMER', data => {
      console.log('hari-->>driver_live_location-->>', data);

      if (
        this.state.booking_details_data?.get_driver_result?.status == '2' &&
        this.state.routeFound &&
        !this.state.startNavigation
      ) {
        this.setState({
          startNavigation: true,
          showFullScreenLoader: false,
        });
      }

      this.setState({
        booking_details_live_data: data.data,
      });
    });
  };

  endNavigation = () => {
    // if (!this.state.startNavigation) return;
    NeNativeModule.endNavigation();
    this.setState({startNavigation: false});
    return true;
  };

  attachNavigationListeners = () => {
    this.navigationEndListener = DeviceEventEmitter.addListener(
      'navigationEnd',
      () => {
        this.endNavigation();
      },
    );

    this.navigationLocationListener = DeviceEventEmitter.addListener(
      'navigationLocation',
      async data => {
        let [
          lat,
          lon,
          remainingDistance,
          remainingDuration,
          speed,
          ldistance,
          lduration,
          navLegIndex,
          bearing,
        ] = data.location;
        this.setState({
          remainingDistance,
          remainingDuration,
          speed,
          lat,
          lon,
          ldistance,
          lduration,
          navLegIndex,
          bearing,
        });
      },
    );
  };

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  payBtn = paymentMethod => {
    let {get_driver_result} = this.state.booking_details_data;

    const paymentDetails = {
      vpa: get_driver_result.upi_id || 'yourupi@address',
      payeeName: get_driver_result.name || 'Raja',
      amount: get_driver_result.estimate_fare,
      transactionRef: 'TXN123456789',
      transactionNote: 'Payment for VM Routes Trip',
    };

    const onSuccess = success => {
      console.log({success});
      this.paymentApi(success.txnId);
    };
    const onFailure = error => {
      console.log({error}, 'lsdhfsdh');
      this.setState({
        ispaymentModalOpen: true,
        paymentMsg: 'Transcation Failed',
      });
    };

    if (paymentMethod == 'cash') {
      this.setState({
        ispaymentModalOpen: true,
        paymentMsg: 'Cash Payment Processing ....',
        showFullScreenLoader: true,
      });
    } else {
      // RNUpiPayment.initializePayment(paymentDetails, onSuccess, onFailure);
    }
  };

  async cancelVehicleSearch() {
    this.setState({showFullScreenLoader: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/customer-cancel-request';

    let payload = {
      phone: this.userID,
      request_id:
        this.state.screenType === 'RideNow'
          ? this.state.ridenow_rqstId
          : this.state.booking_details_data.request_id,
    };
    console.log('hari-->>cancelVehicleSearch-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          this.resetStateAfterBooking();
          NotificationManager.success(data.message, 5000, 'bottom');
        }
      })
      .catch(
        e => (
          console.log('trip-->>cancelVehicleSearch-->>ERROR-->>', e),
          NotificationManager.success(
            'Error While Canceling the Ride',
            5000,
            'bottom',
          )
        ),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  async updateScheduleTripDateTime() {
    this.setState({showFullScreenLoader: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/update-request';

    const updatedTime = new Date(this.state.scheduleTripDetials.time).getTime();

    let payload = {
      phone: this.userID,
      request_id: this.state.booking_details_data.request_id,
      pickuptime: updatedTime.toString(),
      payment_type: this.state.selectedPaymentMethod,
    };

    console.log('hari-->>updateScheduleTripDateTime-->>payload-->>', payload);
    this.setState({
      showTopSelectOptionType: null,
      showScheduleTripTimeOption: false,
    });
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.status) {
          this.setState({
            isSearchingVehicle: false,
            showFullScreenLoader: false,
          });
          NotificationManager.success(data.message, 5000, 'bottom');
        }
      })
      .catch(
        e => console.log('trip-->>updateScheduleTripDateTime-->>ERROR-->>', e),
        this.setState({showFullScreenLoader: false}),
      )
      .finally(() => this.setState({showFullScreenLoader: false}));
  }

  confirmBtnClickHandler() {
    if (
      this.state.startLocationMarker &&
      this.state.endLocationMarker &&
      !this.state.showSearchModal
    ) {
      this.getTripEstimate();
    }
    if (this.state.showSearchModal) {
      this.setState({mapHandlerAdded: true});
    }
    Animated.timing(this.state.translateY, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      this.setState({showSearchModal: false});
    });
    Keyboard.dismiss();
  }

  updateHomeView = label => {
    if (label === 'Schedule') {
      this.setState({
        showScheduleTripTimeOption: true,
      });
    }
    this.setState({screenType: label, showBottomView: false});
  };

  // confrim Hatch Booking
  confirmBooking = label => {
    this.ConfirmBookingapiRequest();
  };

  resetStateAfterBooking = () => {
    this.setState(
      {
        screenType: 'home',
        showBottomView: true,
        searchingForVehicleFares: undefined,
        selectedVehicleFare: undefined,
        startLocationMarker: null,
        endLocationMarker: null,
        isVehicleFound: undefined,
        route: null,
        waypointLocationMarkers: [],
        booking_details_data: undefined,
        isBooked: false,
        startNavigation: false,
        isUpdateDate: false,
        mapHandlerAdded: false,
        isSearchingVehicle: false,
        showSearchModal: false,
      },
      () => (this.mapClickHandler = undefined),
      (this.state.mapFindRoute = null),
    );
  };

  resetStateAfterVehicleFound = () => {
    this.setState(
      {
        screenType: 'home',
        showBottomView: true,
        searchingForVehicleFares: undefined,
        selectedVehicleFare: undefined,
        startLocationMarker: null,
        endLocationMarker: null,
        isVehicleFound: undefined,
        route: null,
        waypointLocationMarkers: [],
        isBooked: false,
        showSearchModal: false,
      },
      () => (this.mapClickHandler = undefined),
      (this.state.mapFindRoute = null),
    );
  };

  showCancelRideAlert = () => {
    Alert.alert('', 'Are you sure you want to go back and Cancel the ride?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'YES',
        onPress: () => {
          this.cancelVehicleSearch();
        },
      },
    ]);
  };

  showCannotGoBackAlert = () => {
    Alert.alert('OnGoing Ride', 'Cannot Go Back', [
      {
        text: 'Ok',
        onPress: () => null,
        style: 'cancel',
      },
    ]);
  };

  // Header Back Button
  onBackPress = value => {
    const {selectedVehicleFare, isBooked, isSearchingVehicle, isVehicleFound} =
      this.state;

    if (value === 'goBack') {
      if (selectedVehicleFare) {
        if (isBooked) {
          this.resetStateAfterBooking();
        } else {
          this.setState({
            selectedVehicleFare: undefined,
            searchingForVehicleFares: true,
          });
        }
      } else if (isSearchingVehicle) {
        return false;
      } else if (isVehicleFound) {
        this.resetStateAfterVehicleFound();
      } else {
        this.resetStateAfterBooking();
      }
    }
  };

  //Hardware Back Button
  handleDeviceBackPress = () => {
    const {
      selectedVehicleFare,
      isBooked,
      showScheduleTripTimeOption,
      isSearchingVehicle,
      isVehicleFound,
      showSummary,
      showTopSelectOptionType,
    } = this.state;

    if (this.state.showFullScreenLoader) {
      return false;
    }

    if (selectedVehicleFare) {
      if (isBooked) {
        if (showScheduleTripTimeOption) {
          this.setState({showScheduleTripTimeOption: false});
        } else {
          this.resetStateAfterBooking();
        }
      } else if (showScheduleTripTimeOption) {
        this.setState({showScheduleTripTimeOption: false});
      } else {
        this.setState({
          selectedVehicleFare: undefined,
          searchingForVehicleFares: true,
        });
      }
    } else if (showScheduleTripTimeOption || showTopSelectOptionType !== null) {
      this.setState({
        showScheduleTripTimeOption: false,
        showTopSelectOptionType: null,
      });
    } else if (isSearchingVehicle) {
      this.showCancelRideAlert();
    } else if (isVehicleFound) {
      this.showCannotGoBackAlert();
    } else if (showSummary) {
      this.resetStateAfterBooking();
    } else {
      this.resetStateAfterBooking();
    }
  };

  // cancel Created booking Request
  onCancelSearch = value => {
    this.cancelVehicleSearch();
  };

  onWayPointsremove = value => {
    let waypointLocationMarkers = this.state.waypointLocationMarkers;

    waypointLocationMarkers.splice(value, 1);

    this.setState(
      {
        waypointLocationMarkers: waypointLocationMarkers,
      },
      () => {
        this.setRoute();
      },
    );
  };

  changeDateTime = (value, paymentType) => {
    if (value === 'updatepayment') {
      this.setState({selectedPaymentMethod: paymentType});
      this.updateScheduleTripDateTime();
    } else {
      this.setState({
        showScheduleTripTimeOption: true,
        isUpdateDate: true,
        selectedVehicleZindex: false,
      });
    }
  };

  getPaymentMethod = value => {
    if (value === 'Cash') {
      this.setState({selectedPaymentMethod: '1'});
    } else {
      this.setState({selectedPaymentMethod: '2'});
    }
  };

  // Location Info
  locationInfo() {
    const {userAddress, toggleMenu, showMenu} = this.props;
    return <LocationInfo address={userAddress} toggleMenu={toggleMenu} showMenu={showMenu} />;
  }


  carIconCallback = () => {
    const {mapInitialLocation} = this.props;
    if (mapInitialLocation?.lat && mapInitialLocation?.lng) {
      this.getNearByDrivers();
    } else {
      Alert.alert('Waiting For User Location');
    }
  };

  notificationIconCallback = () => {
    const {mapInitialLocation} = this.props;
    if (mapInitialLocation?.lat && mapInitialLocation?.lng) {
      this.getNearByDrivers();
    } else {
      Alert.alert('Waiting For User Location');
    }
  };

  // Map Icons
  mapIcons(context) {
    const {zoomToHomeLocation} = this.props;

    let notificationIconCallback = () => {
      context.changeScreen('Notifications');
    };

    return (
      <MapIcons
        zoomToHomeLocation={zoomToHomeLocation}
        carIconCallback={this.carIconCallback}
        notificationIconCallback={notificationIconCallback}
      />
    );
  }

  // Nav Bar
  renderHeader() {
    return (
      <View style={{zIndex: 1}}>
        <Header
          isBottomSheetHandler={true}
          onBack_press={this.onBackPress}
          text={`${
            (this.state.searchingForVehicleFares &&
              !this.state.startNavigation &&
              this.translation['choose_your_ride']) ||
            (this.state.selectedVehicleFare &&
              !this.state.startNavigation &&
              this.translation['destination']) ||
            (this.state.isSearchingVehicle &&
              !this.state.startNavigation &&
              this.translation['finding_taxi']) ||
            (this.state.isVehicleFound &&
              !this.state.startNavigation &&
              this.translation['driver_assigned']) ||
            (!this.state.startNavigation &&
              this.translation['choose_your_ride']) ||
            ''
          }`}
        />
      </View>
    );
  }

  // Header Ride Type
  selectRideType() {
    const onSelectOptionType = type => {
      this.setState(prevState => ({
        ...prevState,
        showTopSelectOptionType: type,
        searchingForVehicleFares: null,
      }));
      Keyboard.dismiss();
    };
    return (
      !this.state.selectedVehicleFare &&
      !this.state.isSearchingVehicle &&
      !this.state.isVehicleFound && (
        <RideTypeButton
          screenType={this.state.screenType}
          selectedPickupType={this.state.selectedPickupType}
          scheduleTripDetials={this.state.scheduleTripDetials}
          onSelectOptionType={onSelectOptionType}
        />
      )
    );
  }

  // Trip and Stop options
  getSelectOptionDropdown(type) {
    let title = type == 'pickuptime' ? 'Pickup Time' : 'Trip Type';
    let selectedOption =
      type == 'pickuptime'
        ? this.state.selectedPickupType
        : this.state.selectedTripType;
    let dropdownOptions =
      type == 'pickuptime' ? this.pickupTypeOptions : this.tripTypeOptions;

    const onDropdownChange = (type, option) => {
      if (type == 'pickuptime') {
        this.setState({
          selectedPickupType: option,
          showTopSelectOptionType: null,
          selectedRideType: option.title,
        });
        if (option.value == 'schedule')
          this.setState({
            showScheduleTripTimeOption: true,
            selectedRideType: option.title,
          });
        this.updateHomeView(option.screenType);
      } else {
        this.setState({
          selectedTripType: option,
          showTopSelectOptionType: null,
        });
      }
    };

    const closeBtn = () => {
      this.setState({showTopSelectOptionType: null});
    };

    return (
      <RideTypeModal
        title={title}
        dropdownOptions={dropdownOptions}
        selectedOption={selectedOption}
        onDropdownChange={onDropdownChange}
        onClose={closeBtn}
        type={type}
      />
    );
  }

  // Schedule Ride Date Time Picker
  getScheduleTripTimeOption() {
    const isTodayDate =
      utils.getCurrentDate(new Date()) ===
      this.state.scheduleTripDetials.date.date;

    let handleDateChange = (option, index) => {
      let scheduleTripDetials = this.state.scheduleTripDetials;
      scheduleTripDetials.date = option;
      this.setState({scheduleTripDetials: scheduleTripDetials});
      scheduleTripDetials.time = new Date();
      this.setState({scheduleTripDetials: scheduleTripDetials});
    };

    let handleTimeChange = value => {
      let scheduleTripDetials = this.state.scheduleTripDetials;
      scheduleTripDetials.time = value;
      console.log(value, scheduleTripDetials, 'value');
      this.setState({scheduleTripDetials: scheduleTripDetials});
    };
    let handleCancel = () => {
      this.setState({
        showTopSelectOptionType: null,
        showScheduleTripTimeOption: false,
        selectedVehicleZindex: true,
      });
    };

    let handleSubmit = () => {
      if (this.state.isBooked) {
        this.updateScheduleTripDateTime();
      }
      this.setState({
        selectedVehicleZindex: true,
        showTopSelectOptionType: null,
        showScheduleTripTimeOption: false,
      });
    };

    return (
      <DateTimeModal
        handleDateChange={handleDateChange}
        isTodayDate={isTodayDate}
        handleTimeChange={handleTimeChange}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        selectedPickupType={this.state.selectedPickupType}
        scheduleTripDetials={this.state.scheduleTripDetials}
        scheduleSatesOptions={this.scheduleSatesOptions}
      />
    );
  }

  // list vehicle types
  onSelectVehicleFare = option => {
    this.setState({
      selectedVehicleFare: option,
      searchingForVehicleFares: false,
    });
  };

  KeyboardFocused = () => {
    this.setState({searchingForVehicleFares: false, showSearchModal: true});
    Animated.timing(this.state.translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  //   Multi Stop Location Picker
  locationPicker() {
    let onLoading = value => {
      this.setState({showFullScreenLoader: value});
    };

    return (
      <MultiStopStartEndLocation
        contentDetials={{
          startTitle: this.translation['your_location'],
          endTitle: this.translation['destination'],
          startImage: require('../../../Assets/HomeScreen/RideNow/StartLocation.png'),
          endImage: require('../../../Assets/HomeScreen/RideNow/EndLocation.png'),
        }}
        defaultStartLocation={this.state.startLocationName}
        defaultEndLocation={this.state.endLocationName}
        setStartLocationName={this.setStartLocationName}
        setWaypointLocations={this.setWaypointLocations}
        setEndLocationName={this.setEndLocationName}
        setMapClickHandler={this.setMapClickHandler}
        onWayPointsremove={this.onWayPointsremove}
        minimize={
          !this.state.selectedVehicleFare &&
          !this.state.isSearchingVehicle &&
          !this.state.isVehicleFound
        }
        textInputFocused={this.KeyboardFocused}
        onLoading={onLoading}
      />
    );
  }

  onDirectionReady = () => {
    this.setState({routeFound: true, showFullScreenLoader: false});
  };

  // Main MapView
  mapView() {
    const {onUserLocationChange, mapInitialLocation, updateMapLoaded} =
      this.props;

    let mapRoute = this.state.mapFindRoute;

    let initializeMarker = this.state.startLocationMarker
      ? {
          lng: this.state.startLocationMarker.lng,
          lat: this.state.startLocationMarker.lat,
          key: this.state.mapInitialLocation?.key || 1,
          zoom: 11,
        }
      : mapInitialLocation;

    let driver_markers = [];
    if (this.state.driverMarkers.length) {
      driver_markers.push(...this.state.driverMarkers);
    }

    let markers = [];
    if (this.state.startLocationMarker)
      markers.push(this.state.startLocationMarker);
    if (this.state.endLocationMarker)
      markers.push(this.state.endLocationMarker);
    if (this.state.waypointLocationMarkers.length)
      markers.push(...this.state.waypointLocationMarkers);

    if (this.state.mapFindRoute) markers = [];

    const homeLocation =
      this.state.startLocationMarker === null
        ? mapInitialLocation
        : {
            lat: this.state.startLocationMarker.lat,
            lng: this.state.startLocationMarker.lng,
            zoom: 8,
          };
    const {translateY} = this.state;
    return (
      <>
        {this.state.showSearchModal && (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Animated.View
              style={{
                transform: [{translateY}],
                width: '100%',
                height: '100%',
                position: 'absolute',
                bottom: 0,
                backgroundColor: 'white',
              }}></Animated.View>
          </TouchableWithoutFeedback>
        )}
        <NEMap
          mapStyle={{
            width: '100%',
            height: this.state.isVehicleFound
              ? WINDOW_HEIGHT * 0.65
              : WINDOW_HEIGHT,
            zIndex: this.state.showSearchModal ? -1 : 0,
          }}
          homeLocation={homeLocation}
          onUserLocationChange={onUserLocationChange}
          updateMapLoaded={updateMapLoaded}
          markers={this.state.screenType === 'home' ? driver_markers : markers}
          onDirectionReady={this.onDirectionReady}
          navigation={this.state.startNavigation}
          // polylines={this.state.route ? [this.state.route] : null}
          onMapClick={this.state.mapHandlerAdded ? this.mapClickHandler : null}
          findRoute={this.state.mapFindRoute}
        />
      </>
    );
  }

  onPaymentChange(option) {
    this.setState({selectedPaymentType: option});
    // this.update_patmerny(option.title);
  }

  makePayment(value) {
    if (value === 'cash') {
      this.setState({ispaymentModalOpen: true});
    } else {
      this.payBtn();
    }
  }

  goHome = () => {
    this.setState({
      screenType: 'home',
      showBottomView: true,
      searchingForVehicleFares: undefined,
      selectedVehicleFare: undefined,
      startLocationMarker: null,
      endLocationMarker: null,
      isVehicleFound: undefined,
      route: null,
      waypointLocationMarkers: [],
      booking_details_data: undefined,
      isBooked: false,
      startNavigation: false,
      mapFindRoute: null,
      isUpdateDate: false,
      selectedPickupType: this.pickupTypeOptions[0],
      showSummary: false,
    });
  };

  // Bottom Sheet View
  bottomSheetView() {
    const {showDetailsView, showMenu} = this.props;
    const {showBottomView} = this.state;

    let selectedOption =
      this.state.selectedPaymentType || this.paymentTypeOptions[0];
    return (
      <>
        {showBottomView && (
          <DraggableBottomSheet
            minHeight={250}
            children={
              !showDetailsView ? (
                <MainMenuContainer
                  showTripDetails={showDetailsView}
                  updateHomeView={this.updateHomeView}
                  showMenu={showMenu}
                />
              ) : (
                <TimelineTrip />
              )
            }
          />
        )}

        {this.state.searchingForVehicleFares ? (
          <DraggableBottomSheet
            minHeight={350}
            children={
              <VehicleList
                itemData={this.state.searchedVehicleFaresList}
                onVehicleSelect={this.onSelectVehicleFare}
              />
            }
          />
        ) : (
          ''
        )}
        {this.state.selectedVehicleFare ? (
          <DraggableBottomSheet
            minHeight={350}
            children={
              <SelectedVehicleInfo
                itemData={this.state.selectedVehicleFare}
                type={this.state.screenType}
                isBooked={this.state.isBooked}
                changeDateTime={this.changeDateTime}
                getPaymentMethod={this.getPaymentMethod}
                confirmBooking={this.confirmBooking}
                onCancel={this.onCancelSearch}
                date_time={this.state.scheduleTripDetials}
                location_name={[
                  {
                    startLocation: this.state.startLocationName,
                    endLocation: this.state.endLocationName,
                    wayPoints: this.state.waypointLocationMarkers,
                  },
                ]}
                isLoadingBtn={this.state.booking_loader}
              />
            }
          />
        ) : (
          ''
        )}

        {this.state.isSearchingVehicle ? (
          <DraggableBottomSheet
            children={<VehicleSearchLoader onCancel={this.onCancelSearch} />}
          />
        ) : (
          ''
        )}

        {this.state.showSummary ? (
          <View style={bottomSheetView.container}>
            <View style={bottomSheetView.detailsContainer}>
              <StatusCompleted
                itemData={this.state.booking_details_data?.get_driver_result}
                isHistory={false}
                requestId={this.state.ridenow_rqstId}
                startLocationName={this.state.startLocationName}
                endLocationName={this.state.endLocationName}
                goHome={this.goHome}
              />
            </View>
          </View>
        ) : (
          ''
        )}

        {this.state.isVehicleFound ? (
          <View style={bottomSheetView.container}>
            {this.state.booking_details_data?.get_driver_result?.status ==
            '2' ? (
              <TouchableOpacity style={bottomSheetView.sosButton}>
                <View style={bottomSheetView.sosButtonContent}>
                  <Text style={bottomSheetView.sosButtonText}>
                    {this.translation['sos']}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={bottomSheetView.otpButton}>
                <Text style={bottomSheetView.otpButtonText}>OTP</Text>
                <Text style={bottomSheetView.otpText}>
                  {this.state.booking_details_data?.get_driver_result.otp ||
                    '1234'}
                </Text>
              </View>
            )}
            <View style={bottomSheetView.detailsContainer}>
              <GetDriverDetails
                itemData={this.state.booking_details_data}
                liveData={this.state.booking_details_live_data}
                startLocationName={this.state.startLocationName}
                endLocationName={this.state.endLocationName}
                type={this.state.selectedRideType}
                date_time={this.state.scheduleTripDetials}
                onCancel={this.onCancelSearch}
                location_name={[
                  this.state.startLocationName,
                  this.state.endLocationName,
                ]}
              />
            </View>
          </View>
        ) : null}
      </>
    );
  }

  render() {
    const {screenType} = this.state;
    return (
      <HomeScreenContext.Consumer>
        {context => (
          <View style={styles.mainContainer}>
            {this.state.showFullScreenLoader ? (
              <FullScreenLoader message={this.state.paymentMsg || 'Loading'} />
            ) : null}
            {screenType === 'home' && this.props.sideBarMenus}
            <CustomBackHandler onBackPress={this.handleDeviceBackPress} />
            <Animated.View
              style={[
                styles.animatedStyles,
                {
                  borderRadius: this.props.showMenu ? 15 : 0,
                  transform: [
                    {scale: this.scaleValue},
                    {translateX: this.offsetValue},
                  ],
                },
              ]}>
              <Animated.View
                style={[
                  RideNowTripsStyles.ridenowTripCreateContainer,
                  {transform: [{translateY: this.closeButtonOffset}]},
                ]}>
                <View
                  style={[RideNowTripsStyles.ridenowTripCreateContainer, {}]}>
                  {screenType === 'home' && this.locationInfo()}
                  {screenType === 'home' && this.mapIcons(context)}
                  {screenType !== 'home' && this.renderHeader()}
                  {this.mapView()}
                  {!this.state.searchingForVehicleFares ? (
                    <TouchableOpacity
                      disabled={
                        (!this.state.startLocationMarker ||
                          !this.state.endLocationMarker) &&
                        !this.state.showSearchModal
                      }
                      onPress={() => this.confirmBtnClickHandler()}
                      style={
                        this.state.showSearchModal
                          ? [
                              buttonStyles.LocatebuttonContainer,
                              RideNowTripsStyles.ridenowLocateMapBtn,
                            ]
                          : [
                              buttonStyles.buttonContainer,
                              RideNowTripsStyles.ridenowTripCreateConfirmBtn,
                              {
                                opacity:
                                  (!this.state.startLocationMarker ||
                                    !this.state.endLocationMarker) &&
                                  !this.state.showSearchModal
                                    ? 0.8
                                    : 1,
                              },
                            ]
                      }>
                      {this.state.showSearchModal && (
                        <Image
                          source={LocateOnMap}
                          style={{
                            width: '5%',
                            aspectRatio: 3 / 4,
                            marginRight: 15,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: this.state.showSearchModal ? 'black' : 'white',
                        }}>
                        {this.state.showSearchModal
                          ? this.translation['locate_on_map']
                          : this.translation['confirm_destination']}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    ''
                  )}
                  {screenType !== 'home' && this.selectRideType()}

                  {this.state.showTopSelectOptionType != null &&
                  !this.state.showScheduleTripTimeOption
                    ? this.getSelectOptionDropdown(
                        this.state.showTopSelectOptionType,
                      )
                    : ''}
                  {this.state.showScheduleTripTimeOption &&
                  !this.state.showTopSelectOptionType
                    ? this.getScheduleTripTimeOption()
                    : ''}

                  {screenType !== 'home' && this.locationPicker()}
                  {this.bottomSheetView()}
                </View>
              </Animated.View>
            </Animated.View>

            <CustomModal
              visible={this.state.ispaymentModalOpen}
              style={[commonStyles.modalContainer, {padding: 20}]}
              closeModalonBackPress={() =>
                this.setState({ispaymentModalOpen: false})
              }
              children={
                <View style={commonStyles.modalContent}>
                  <Text
                    style={[
                      textStyle.textnormal,
                      commonStyles.modalText,
                      {padding: 20},
                    ]}>
                    {this.state.paymentMsg}
                  </Text>
                  <View style={commonStyles.modalButtonContainer}>
                    <TouchableOpacity
                      onPress={() => this.setState({ispaymentModalOpen: false})}
                      style={[
                        commonStyles.closeButton,
                        {backgroundColor: 'black', marginRight: 10},
                      ]}>
                      <Text style={[textStyle.textnormal, {color: 'white'}]}>
                        {this.translation['okay']}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />
            <CustomModal
              visible={
                this.state.booking_details_data?.get_driver_result?.status ==
                  '3' &&
                !this.state.showSummary &&
                this.state.booking_details_data?.get_driver_result
                  ?.payment_status == '0'
              }
              style={[commonStyles.modalContainer]}
              closeModalonBackPress={() =>
                this.setState({ispaymentModalOpen: false})
              }
              children={
                <View
                  key={0}
                  style={{flex: 1, width: '100%', backgroundColor: 'white'}}>
                  <PaymentMethodDetails
                    itemData={this.state.booking_details_data}
                    onCancel={this.onCancelSearch}
                    onPaymentChange={this.payBtn}
                  />
                </View>
              }
            />
          </View>
        )}
      </HomeScreenContext.Consumer>
    );
  }
}

InstantTrips.contextType = GlobalContext;

export default InstantTrips;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    position: 'relative',
  },
  animatedStyles: {
    flexGrow: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
