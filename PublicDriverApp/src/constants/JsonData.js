import React from 'react';
import OnBoardA from '../assets/image/onboarding/onboardA.svg';
import OnBoardB from '../assets/image/onboarding/onboardB.svg';
import OnBoardC from '../assets/image/onboarding/onboardC.svg';
import OnBoardD from '../assets/image/onboarding/onboardD.svg';

import ThingsA from '../assets/image/svgIcons/thingsA.svg';
import ThingsB from '../assets/image/svgIcons/thingsB.svg';
import ThingsC from '../assets/image/svgIcons/thingsC.svg';
import ThingsD from '../assets/image/svgIcons/thingsD.svg';

import FindCand from '../assets/image/svgIcons/Find_candidate.svg';
import Integrity from '../assets/image/svgIcons/integrity.svg';
import CreditCard from '../assets/image/svgIcons/credit-card-slash.svg';

import Male from '../assets/image/svgIcons/male.svg';
import Female from '../assets/image/svgIcons/female.svg';

import Auto from '../assets/image/vehicles/auto.svg';
import HatchBack from '../assets/image/vehicles/hatchback.svg';
import Sedan from '../assets/image/vehicles/sedan.svg';
import SUV from '../assets/image/vehicles/suv.svg';
import Bike from '../assets/image/vehicles/motorbike.svg';

export const languages = [
  {
    id: 1,
    name: 'தமிழ்',
    code: 'ta',
  },
  {
    id: 2,
    name: 'English',
    code: 'en',
  },
  {
    id: 3,
    name: 'हिन्दी',
    code: 'hi',
  },
];

export const welcomeData = [
  {
   id:1,
   desc: 'Namma Ooru Taxi ® helps customers to find your taxi on map',
   image : <FindCand />
  },
  {
    id:2,
    desc: 'Provide correct details and necessary documents. Your registration will be approved approximately in 2 - 4 days. Once it got approved, you may get calls from our customers',
    image : <Integrity />
  },
  {
    id:3,
    desc:"We do not charge you any commission fees. You can directly discuss about the trip fare with our customers and get paid",
    image : <CreditCard />
  }
]

export const onBoardingSlides = [
  {
    id: 1,
    title: 'Get Call from the Customers',
    image: <OnBoardA />,
    description:"Speak Politely to your customers. Ask the place where they want to go and the reasonable price for the trip",
    note: "You can ask the customer if the person is calling through our app Namma Ooru Taxi ®",
  },
  {
    id: 2,
    title: 'Get Pickup Location and Start',
    image: <OnBoardB />,
    description: "Negotiate your rate and ask them to share the pickup location with Namma Ooru Taxi ® app. Receive the pick-up location via notification and accept it to start the trip",
    note: "Make Sure you have contacted the customer to confirm and start trip"
  },
  {
    id: 3,
    title: 'Pickup the Customer',
    image: <OnBoardC />,
    description: "Pickup the customer on time. Set the destination location in the app and start app navigation"
  },
  {
    id: 4,
    title: 'Reviews are important',
    image: <OnBoardD />,
    description: "Try to get good reviews from customer who can increase visibility and commitment. The customer will evaluate your behavior, tariff and cleanliness of the vehicle",
  },
];

export const ThingsToKnowData = [
  {
    id:1,
    desc : 'Identify our customers as they call and speak politely with them',
    image: <ThingsA />,
  },
  {
    id:2,
    desc : 'Call customer before starting or cancelling the trip',
    image: <ThingsB />,
  },
  {
    id:3,
    desc : 'Ask the reasonable price for the trip and become a preferred driver for your customers, Preferred driver have more priority that others',
    image: <ThingsC />,
  },
  {
    id:4,
    desc : 'Ratings are the key to more commitment. Make sure you get a good rating.',
    image: <ThingsD />,
  },
]

export const genderData = [
  {
    id:1,
    name:'Male',
    icon:< Male />
  },{
    id:2,
    name:'Female',
    icon:< Female />
  }
]

export const vehicleList = [
  {
    id:1,
    name:'Auto Rickshaw',
    image: <Auto />
  },
  {
    id:2,
    name:'HatchBack',
    image: <HatchBack />
  },
  {
    id:3,
    name:'Sedan',
    image: <Sedan />
  },
  {
    id:4,
    name:'SUV',
    image: <SUV />
  },
  {
    id:5,
    name:'Motor Bike',
    image: <Bike />
  }
]

export const documentsList = [
  {
    id:1,
    name :'Vehicle Registration Number'
  },
  {
    id:2,
    name :'Driving License'
  },
  {
    id:3,
    name :'Vehicle RC Book'
  },
  {
    id:4,
    name :'Insurance'
  },
  {
    id:5,
    name :'Aadhar Card'
  },
  {
    id:6,
    name :'PAN Card'
  },
  {
    id:7,
    name :'Driver Photo'
  },
  {
    id:8,
    name :'Vehicle Photo'
  }
]