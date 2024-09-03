import OnBoardA from '../assets/image/onboarding/onboardA.svg';
import OnBoardB from '../assets/image/onboarding/onboardB.svg';
import OnBoardC from '../assets/image/onboarding/onboardC.svg';

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

export const onBoardingSlides = [
  {
    id: 1,
    title: 'Quick and Easy Bookings',
    image: <OnBoardA />,
    description:
      "Choose your destination, pick your ride, and you're on your way in just a few taps.",
  },
  {
    id: 2,
    title: 'Set Your Destination',
    image: <OnBoardB />,
    description:
      'Whether it`s a ride home, the office, or an adventure, "Namma Ooru Taxi ®" is ready to take you there.',
  },
  {
    id: 3,
    title: 'Track Your Ride',
    image: <OnBoardC />,
    description:
      "Watch your driver's arrival in real-time and stay updated with their location. No more guessing when your ride will arrive.",
  },
];
