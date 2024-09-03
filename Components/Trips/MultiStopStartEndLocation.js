import React from 'react';
import {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';

import {RideNowTripsStyles, searchStyle} from '../../Styles/Home/RideNow';
import LocationSearch from '../Common/LocationSearch';
import {SearchAPI} from '../../Controllers/NEMap/Search';
import {utils} from '../../Controllers/utils';
import NotificationManager from '../../Components/Notification/NotificationManager';
// styles

// images
import StartLocationImage from '../../Assets/HomeScreen/InstantTrips/StartLocation.webp';
import EndLocationImage from '../../Assets/HomeScreen/InstantTrips/EndLocation.webp';
import AddmultiwaypointImage from '../../Assets/HomeScreen/RideNow/addmultiwaypoint.png';
import DeletewaypointImage from '../../Assets/HomeScreen/RideNow/delete.png';
import DraggbleImg from '../../Assets/CustomeronBoardScreen/Drag.svg';
import DragAndDropCard from '../../Controllers/CustomComponent/DragDrop';
import Icon from 'react-native-vector-icons/Ionicons';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../CustomerComponent/locales/TranslationFile';

class MultiStopStartEndLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLocationSearch: false,
      startLocationName: props.startLocationName || '',
      endLocationName: props.endLocationName || '',
      searchData: null,
      activeInputType: 'null',
      showStartLocationLoader: false,
      showEndLocationLoader: false,
      showWaypointLocationLoader: -1,
      topOffset: 0,
      waypoints: [],
      isKeyboardOpen: false,
    };

    this.translation = getRedirection(TranslationFile);
    this.searchAPI = new SearchAPI();
    this.searchData = this.searchData.bind(this);
    this.setLocation = this.setLocation.bind(this);

    this.contentDetials = this.props.contentDetials || undefined;

    this.startTextInputRef = React.createRef();
    this.waypointTextInputRef = Array.from({length: 5}, () =>
      React.createRef(),
    );
    this.endTextInputRef = React.createRef();
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    );
  }

  keyboardDidShow = () => {
    this.setState({isKeyboardOpen: true});
  };

  keyboardDidHide = () => {
    this.setState({isKeyboardOpen: false});
  };

  async searchData() {
    this.setState(prevState => ({
      ...prevState,
      data: null,
    }));
    let {activeInputType, waypoints} = this.state;
    let searchText = activeInputType.includes('waypoint')
      ? waypoints[parseInt(activeInputType.split('-')[1])].locationName
      : activeInputType == 'start'
        ? this.state.startLocationName
        : this.state.endLocationName;
    this.setState(prevState => ({
      ...prevState,
      showStartLocationLoader: activeInputType == 'start' ? true : false,
      showEndLocationLoader: activeInputType == 'end' ? true : false,
      showWaypointLocationLoader: activeInputType.includes('waypoint')
        ? parseInt(activeInputType.split('-')[1])
        : -1,
    }));
    let data;
    try {
      data = await this.searchAPI.search(searchText);
      this.setState(prevState => ({
        ...prevState,
        searchData: data,
        showStartLocationLoader: false,
        showEndLocationLoader: false,
        showWaypointLocationLoader: -1,
      }));
    } catch (error) {
      if (error.name === 'AbortError') {
        // leave abort error no need to handle it
      } else {
        throw error;
      }
    }
  }

  setStartLocationName(name) {
    this.setState(
      prevState => ({
        ...prevState,
        startLocationName: name,
      }),
      this.searchData,
    );
    if (this.state.endLocationName.length === 0) {
      this.props.setEndLocationName(null);
    }
    if (name.length === 0) {
      this.props.setStartLocationName(null);
    }
  }

  setEndLocationName(name) {
    this.setState(
      prevState => ({
        ...prevState,
        endLocationName: name,
      }),
      this.searchData,
    );
    if (this.state.startLocationName.length === 0) {
      this.props.setStartLocationName(null);
    }
    if (name.length === 0) {
      this.props.setEndLocationName(null);
    }
  }

  setLocation(location, coordinates) {
    if (this.state.activeInputType.includes('waypoint')) {
      let waypoints = [...this.state.waypoints];

      waypoints[
        parseInt(this.state.activeInputType.split('-')[1])
      ].locationName = location;
      waypoints[
        parseInt(this.state.activeInputType.split('-')[1])
      ].coordinates = coordinates;

      this.setState({waypoints: waypoints});

      this.props.setWaypointLocations(waypoints);
    } else if (this.state.activeInputType == 'start') {
      this.setState(prevState => ({
        ...prevState,
        startLocationName: location,
      }));
      //update parent component
      this.props.setStartLocationName(location, coordinates);
    } else {
      this.setState(prevState => ({
        ...prevState,
        endLocationName: location,
      }));
      //update parent component
      this.props.setEndLocationName(location, coordinates);
    }
    // close the keyboard on selection
    Keyboard.dismiss();
    this.setState({showLocationSearch: false});
  }

  oninputFocus(type) {
    this.setState(prevState => ({
      ...prevState,
      showLocationSearch: true,
      activeInputType: type,
    }));
    this.props.textInputFocused('true');
  }

  oninputBlur() {
    this.setState(prevState => ({
      ...prevState,
      showLocationSearch: false,
      // activeInputType: null,
      searchData: null,
    }));
  }

  componentDidMount() {
    this.props.setMapClickHandler
      ? this.props.setMapClickHandler(this.onMapClickHandler.bind(this))
      : null;
  }

  async onMapClickHandler(data) {
    let {latitude, longitude} = data;
    let locationName = longitude + ',' + latitude;
    let {activeInputType} = this.state;

    if (activeInputType.includes('waypoint')) {
      this.setState({
        showWaypointLocationLoader: parseInt(activeInputType.split('-')[1]),
      });
    }
    if (activeInputType == 'start') {
      this.setState({showStartLocationLoader: true});
      this.props.onLoading(true)
    } else if (activeInputType == 'end') {
      this.setState({showEndLocationLoader: true});
      this.props.onLoading(true)
    }
    try {
      let data = await this.searchAPI.reverseGeocode([latitude, longitude]);
      let {properties} = data;
      let {name, city, state, country} = properties;
      const parts = [name, city, state, country];
      let place = parts.filter(Boolean).join(', ');
      locationName = place;
    } catch (error) {
      console.log(error);
    }

    let waypoints = [...this.state.waypoints];

    if (this.state.activeInputType.includes('waypoint')) {
      waypoints[
        parseInt(this.state.activeInputType.split('-')[1])
      ].locationName = locationName;
      waypoints[
        parseInt(this.state.activeInputType.split('-')[1])
      ].coordinates = [longitude, latitude];
    }
    this.setState(prevState => ({
      ...prevState,
      startLocationName:
        this.state.activeInputType == 'start'
          ? locationName
          : this.state.startLocationName,
      endLocationName:
        this.state.activeInputType == 'end'
          ? locationName
          : this.state.endLocationName,
      waypoints: this.state.activeInputType.includes('waypoint')
        ? waypoints
        : this.state.waypoints,
      showStartLocationLoader: false,
      showEndLocationLoader: false,
      showWaypointLocationLoader: -1,
    }));

    this.state.activeInputType == 'start'
      ? (this.props.setStartLocationName(locationName, [longitude, latitude]),this.props.onLoading(false))
      : this.state.activeInputType == 'end'
        ? (this.props.setEndLocationName(locationName, [longitude, latitude]),this.props.onLoading(false))
        : this.state.activeInputType.includes('waypoint')
          ? this.props.setWaypointLocations(waypoints)
          : '';
  }

  onAddNewWaypoint() {
    if (this.state.waypoints.length >= 4)
      return NotificationManager.error('You can add maximum 5 waypoints');

    let waypoint = {
      locationName: '',
      location: undefined,
      id: utils.createUUID(),
    };
    this.setState({
      waypoints: [...this.state.waypoints, waypoint],
    });
  }
  onDeleteWaypoint(index) {
    let waypoints = [...this.state.waypoints];

    waypoints.splice(index, 1);

    this.setState({waypoints: waypoints});

    this.props.onWayPointsremove(index);
  }

  setWaypointLocationName(name, index) {
    let waypoints = [...this.state.waypoints];

    waypoints[index].locationName = name;

    this.setState(
      prevState => ({
        ...prevState,
        waypoints: waypoints,
      }),
      this.searchData,
    );

    if (name.length === 0) {
      this.props.onWayPointsremove(index);
    }
  }

  moveItem = (dragIndex, hoverIndex, isMoved) => {
    const draggedItem = this.state.waypoints[dragIndex];
    const waypoints = [...this.state.waypoints];
    if (!isMoved){
      waypoints.splice(dragIndex, 1); // Remove the dragged item
      waypoints.splice(hoverIndex, 0, draggedItem); // Insert it at the hover index
    }
    this.setState({waypoints});
    this.props.setWaypointLocations(waypoints,isMoved);
  };

  focusSelectedWaypointInput = (isMoved, inputRef, i) => {
    if (isMoved) {
      if (inputRef[i]) {
        inputRef[i].current.focus();
      } else {
        inputRef.current.focus();
      }
      this.props.textInputFocused('true');
    }
  };

  render() {
    return (
      <View
        style={[
          RideNowTripsStyles.ridenowTripLocationInputsMain,
          {display: !this.props.minimize ? 'none' : 'flex'},
        ]}>
        <View
          style={{width: '100%', position: 'relative', alignItems: 'center'}}>
          {this.state.waypoints.length === 0 ? (
            <View style={RideNowTripsStyles.ridenowTripLocationInputsContainer}>
              {/* <TouchableOpacity
                onPress={() => this.onAddNewWaypoint()}
                style={RideNowTripsStyles.addWaypointbutton}>
                <Image
                  style={RideNowTripsStyles.addWaypointbuttonIcon}
                  source={AddmultiwaypointImage}
                />
              </TouchableOpacity> */}
              <View
                style={[
                  RideNowTripsStyles.ridenowTripLocationInputContainer,
                  {borderTopWidth: 0},
                ]}>
                <Text style={RideNowTripsStyles.inputLabel}>
                  {this.contentDetials
                    ? this.contentDetials.startTitle
                    : this.translation['your_location']}
                </Text>
                <Image
                  style={RideNowTripsStyles.ridenowTripCreateInputIcon}
                  source={
                    this.contentDetials
                      ? this.contentDetials.startImage
                      : StartLocationImage
                  }
                />
                <TextInput
                  onFocus={() => this.oninputFocus('start')}
                  onBlur={() => this.oninputBlur()}
                  style={RideNowTripsStyles.ridenowTripCreateHeaderInput}
                  onChangeText={value => this.setStartLocationName(value)}>
                  {this.state.startLocationName}
                </TextInput>
                {this.state.showStartLocationLoader ? (
                  <ActivityIndicator />
                ) : null}
              </View>

              {this.state.waypoints?.map((waypoint, i) => (
                <View
                  key={`${this.translation['waypoint']}-${i}`}
                  style={RideNowTripsStyles.ridenowTripLocationInputContainer}>
                  <Text style={RideNowTripsStyles.inputLabel}>
                    Waypoint {i + 1}
                  </Text>
                  <Image
                    style={RideNowTripsStyles.ridenowTripCreateInputIcon}
                    source={
                      this.contentDetials
                        ? this.contentDetials.startImage
                        : StartLocationImage
                    }
                  />
                  <TextInput
                    onFocus={() => this.oninputFocus(`waypoint-${i}`)}
                    onBlur={() => this.oninputBlur()}
                    style={RideNowTripsStyles.ridenowTripCreateHeaderInput}
                    onChangeText={value =>
                      this.setWaypointLocationName(value, i)
                    }>
                    {waypoint.locationName}
                  </TextInput>
                  {this.state.showWaypointLocationLoader == i ? (
                    <ActivityIndicator />
                  ) : null}
                  <TouchableOpacity
                    onPress={() => this.onDeleteWaypoint(i)}
                    style={RideNowTripsStyles.deleteWaypointbutton}>
                    <Image
                      style={RideNowTripsStyles.deleteWaypointbuttonIcon}
                      source={DeletewaypointImage}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <View
                style={RideNowTripsStyles.ridenowTripLocationInputContainer}>
                <Text style={RideNowTripsStyles.inputLabel}>
                  {this.contentDetials
                    ? this.contentDetials.endTitle
                    : this.translation['destination']}
                </Text>
                <Image
                  style={RideNowTripsStyles.ridenowTripCreateInputIcon}
                  source={
                    this.contentDetials
                      ? this.contentDetials.endImage
                      : EndLocationImage
                  }
                />
                <TextInput
                  onFocus={() => this.oninputFocus('end')}
                  onBlur={() => this.oninputBlur()}
                  onChangeText={value => this.setEndLocationName(value)}
                  style={RideNowTripsStyles.ridenowTripCreateHeaderInput}>
                  {this.state.endLocationName}
                </TextInput>
                {this.state.showEndLocationLoader ? (
                  <ActivityIndicator />
                ) : null}
              </View>
            </View>
          ) : (
            <View
              onLayout={event => {
                const {y, height} = event.nativeEvent.layout;
                this.setState({topOffset: y + height}); // Add header height to the y position of the list
              }}
              style={RideNowTripsStyles.ridenowTripLocationInputsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 10,
                }}>
                <Image
                  source={
                    this.contentDetials
                      ? this.contentDetials.startImage
                      : StartLocationImage
                  }
                  style={{width: 30, height: 30, marginRight: 10}}
                />
                <DragAndDropCard
                  index={0}
                  topOffset={this.state.topOffset}
                  onDragEnd={(dragIndex, hoverIndex, isMoved) => {
                    this.moveItem(dragIndex, hoverIndex),
                      this.focusSelectedWaypointInput(isMoved, this.startTextInputRef);
                  }}
                  children={
                    <View
                      style={{
                        backgroundColor: '#f5f5f5',
                        borderRadius: 10,
                        width: '90%',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <TextInput
                        ref={this.startTextInputRef}
                        onFocus={() => this.oninputFocus('start')}
                        onBlur={() => this.oninputBlur()}
                        underlineColor="transparent"
                        style={{height: 40, width: '100%', paddingLeft: 10}}
                        placeholder={this.translation['start_location']}
                        onChangeText={value => this.setStartLocationName(value)}
                        value={this.state.startLocationName}
                      />
                      <DraggbleImg
                        style={{
                          position: 'absolute',
                          right: 10,
                          width: '50%',
                          height: 50,
                        }}
                      />
                    </View>
                  }
                />
              </View>

              {this.state.waypoints?.map((waypoint, i) => {
                return (
                  <View
                    key={`waypoint-${i}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingBottom: 10,
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        backgroundColor: 'black',
                        width: 30,
                        height: 30,
                        justifyContent: 'center',
                        borderRadius: 5,
                        marginRight: 10,
                      }}>
                      <Text style={{color: 'white'}}>{i + 1}</Text>
                    </View>
                    <DragAndDropCard
                      index={i}
                      topOffset={this.state.topOffset}
                      onDragEnd={(dragIndex, hoverIndex, isMoved) => {
                        this.moveItem(dragIndex, hoverIndex, isMoved),
                          this.focusSelectedWaypointInput(
                            isMoved,
                            this.waypointTextInputRef,
                            i,
                          );
                      }}
                      length={this.state.waypoints.length}
                      children={
                        <View
                          style={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: 10,
                            width: '90%',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TextInput
                            ref={this.waypointTextInputRef[i]}
                            onFocus={() => this.oninputFocus(`waypoint-${i}`)}
                            onBlur={() => this.oninputBlur()}
                            underlineColor="transparent"
                            style={{height: 40, width: '100%', paddingLeft: 10}}
                            placeholder={`${this.translation['waypoint']}-${i + 1}`}
                            onChangeText={value =>
                              this.setWaypointLocationName(value, i)
                            }
                            value={waypoint.locationName}
                          />
                          <DraggbleImg
                            style={{
                              position: 'absolute',
                              right: 10,
                              width: '50%',
                              height: 50,
                            }}
                          />
                        </View>
                      }
                    />
                    <TouchableOpacity
                      onPress={() => this.onDeleteWaypoint(i)}
                      style={{
                        ...RideNowTripsStyles.deleteWaypointbutton,
                        top: 13,
                      }}>
                      <Image
                        style={RideNowTripsStyles.deleteWaypointbuttonIcon}
                        source={DeletewaypointImage}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.onAddNewWaypoint();
                  }}
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'black',
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    marginRight: 10,
                    borderRadius: 5,
                  }}>
                  <Icon name="add" size={18} color="white" />
                </TouchableOpacity>
                <DragAndDropCard
                  topOffset={this.state.topOffset}
                  onDragEnd={(dragIndex, hoverIndex, isMoved) =>
                    this.focusSelectedWaypointInput(isMoved, this.endTextInputRef)
                  }
                  children={
                    <View
                      style={{
                        backgroundColor: '#f5f5f5',
                        borderRadius: 10,
                        width: '90%',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <TextInput
                        ref={this.endTextInputRef}
                        onFocus={() => this.oninputFocus(`end`)}
                        onBlur={() => this.oninputBlur()}
                        underlineColor="transparent"
                        style={{height: 40, width: '100%', paddingLeft: 10}}
                        placeholder={this.translation['add_end_location']}
                        onChangeText={value => this.setEndLocationName(value)}
                        value={this.state.endLocationName}
                      />
                      <DraggbleImg
                        style={{
                          position: 'absolute',
                          right: 10,
                          width: '50%',
                          height: 50,
                        }}
                      />
                    </View>
                  }
                />
              </View>
            </View>
          )}
        </View>
        {this.state.showLocationSearch ? (
          <View style={[searchStyle.container, searchStyle.bottom]}>
            <LocationSearch
              data={this.state.searchData}
              setLocation={this.setLocation}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

export default MultiStopStartEndLocation;
