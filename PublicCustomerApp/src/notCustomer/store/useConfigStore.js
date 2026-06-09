import { create } from 'zustand';

const defaultConfig = {
  APP: 'PUBLICRIDE_CUSTOMER_APP',
  APP_NAME: 'Namma Ooru Taxi',
  COMPANYNAME: 'Namma Ooru Taxi',
  COMPANYADDRESS: '123, Main Street, Anytown, USA',
  COMPANYPHONE: '+1234567890',
  COMPANYEMAIL: 'info@nammaoorutaxi.com',
  APP_VERSION: '1.0.0',
  APP_BUILD_NUMBER: '1',
  APP_BUILD_VERSION: '1.0.0',
  SHOW_WAIT_PRICE_INFO: false,
  DEFAULT_WAIT_TIME: 5,
  WAIT_TIME_CHARGES_PER_MINUTE: 2,
  MAX_WAIT_TIME: 60,
  PAYMENT_METHODS: 'PG',
  SHOW_NEARBY_DRIVER: false,
  DRIVER_LOCATION_UPDATE_INTERVAL: 10,
  TOTAL_STOPS_ALLOWED: 2,
  SHOW_NEARBY_DRIVER_RADIUS: 10000,
  MIN_TRIP_DISTANCE_METER: 100,
  CUSTOMER_CANCEL_PENALTY:true,
  CUSTOMER_CANCEL_PENALTY_LIMIT: 3,
  IN_APP_REVIEW_ALWAYS: true,
  IN_APP_REVIEW_REQUIRED_RATING: 3,
  SOCIAL_MEDIA_LINKS: {
    facebook: 'https://www.facebook.com/nammaoorutaxi',
    twitter: 'https://twitter.com/nammaoorutaxi',
    instagram: 'https://www.instagram.com/nammaoorutaxi',
    linkedin: 'https://www.linkedin.com/company/nammaoorutaxi',
  },
  // eslint-disable-next-line prettier/prettier
  actingDriverEnabled: true,
  ACTING_DRIVER_ARRANGEMENTS: [
    { key: 'accommodation', label: 'Driver Accommodation', desc: 'Driver stay arrangements will be borne by the customer.', icon: 'bed',        iconLib: 'Ionicons',                 enabled: true },
    { key: 'food',          label: 'Driver Food Allowance', desc: 'Food allowance for driver',                               icon: 'restaurant', iconLib: 'Ionicons',                 enabled: true },
  ],
  ACTING_DRIVER_SPECIAL_REQUIREMENTS: [
    { key: 'kids',          label: 'Children on Board',    desc: '',                             icon: 'baby-carriage', iconLib: 'MaterialCommunityIcons', type: 'toggle', enabled: true },
    { key: 'elderly',       label: 'Elderly Passengers',   desc: '',                             icon: 'human-cane',    iconLib: 'MaterialCommunityIcons', type: 'toggle', enabled: true },
    { key: 'maxSpeed',      label: 'Comfort Speed',        desc: 'Auto speed for driver',        icon: 'speedometer',   iconLib: 'Ionicons',               type: 'number', enabled: true },
    { key: 'otherRequests', label: 'Custom Request / Notes', desc: '',                           icon: 'document-text', iconLib: 'Ionicons',               type: 'text',   enabled: true },
  ],
  HOME_SCREEN_CONFIG: [
    {
      key: 'services',
      sectionTitle: 'Choose Your Ride',
      showSectionTitle: false,
      items: [
        { key: 'auto',           label: 'Auto',           bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
        { key: 'electric_auto', label: 'Electric Auto',  bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
        { key: 'schedule_trip', label: 'Schedule',       bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
        { key: 'female_driver', label: 'Female Driver',  bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
        { key: 'night_trip',    label: 'Night Ride',     bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
        { key: 'acting_driver', label: 'Acting Driver',  bgColor: '#f3f3f3ff', textColor: '#858585ff', borderColor: '#ffffffff' },
      ],
    },
    {
      key: 'horizontal_banners',
      sectionTitle: 'Offers',
      showSectionTitle: false,
      items: [
        { id: 'bannerStops',  key: 'bannerStops',  label: 'Multi Stop' },
        { id: 'bannerFamily', key: 'bannerFamily', label: 'Family Ride' },
        { id: 'bannerAuto',   key: 'bannerAuto',   label: 'Female Driver' },
      ],
    },
  ],
};

const useConfigStore = create((set, get) => ({
  appConfig: { ...defaultConfig },
  updateAvailable: false,

  setConfig: (newConfig) => set({ appConfig: { ...defaultConfig, ...newConfig } }),

  updateConfig: (partial) =>
    set((state) => ({
      appConfig: { ...state.appConfig, ...(partial || {}) }
    })),

  resetConfig: () => set({ appConfig: { ...defaultConfig } }),
  setUpdateAvailable: (isAvailable) => set({ updateAvailable: isAvailable }),
}));

export default useConfigStore;
