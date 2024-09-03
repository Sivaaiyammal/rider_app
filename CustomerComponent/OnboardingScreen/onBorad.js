import React, { Component } from 'react';
import OnboardScreen from '../../Components/onBoard/onBoardScreen';

//Images

const tabOneImage = require('../../Assets/CustomeronBoardScreen/tabOneImage.png');
const tabTwoImage = require('../../Assets/CustomeronBoardScreen/tabTwoImage.png');
const tabThreeImage = require('../../Assets/CustomeronBoardScreen/tabThreeImage.png');

class OnBoard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <OnboardScreen
        handleDone={() => this.props.navigation.navigate('AuthenticationScreen')}
        pages={[
          {
            title: ['Quick and Easy', 'Bookings'],
            subtitle: "Choose your destination, pick your ride, and you're on your way in just a few taps",
            backgroundColor: '#fff',
            image: tabOneImage,
          },
          {
            title: ['Set Your', 'Destination'],
            subtitle: `Whether it's a ride home, the office, or an adventure, "VM Routes ®" is ready to take you there.`,
            backgroundColor: '#fff',
            image: tabTwoImage,
          },
          {
            title: ['Track Your', 'Ride'],
            subtitle: "Watch your driver's arrival in real-time and stay updated with their location. No more guessing when your ride will arrive.",
            backgroundColor: '#fff',
            image: tabThreeImage,
          }
        ]}
      />
    );
  }
}

export default OnBoard;
