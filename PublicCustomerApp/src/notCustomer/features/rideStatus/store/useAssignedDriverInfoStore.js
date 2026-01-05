import { create } from 'zustand';

const useAssignedDriverInfoStore = create((set) => ({
  driverName: '',
  driverPhoto: '',
  rating: null,
  phone: '',
  vehicleNumber: '',
  model: '',
  brand: '',
  color: '',
  driverLatitude: null,
  driverLongitude: null,
  driverAngle: null,
  driverMaxSpeed: null,
  driverUPIId: null,

  setDriverInfo: (info) =>
    set((state) => ({
      ...state,
      ...info,
    })),


  setAllocatedDriverInfo: (info) =>
    set({
      driverName: info.driverName,
      driverPhoto: info?.driverPhoto,
      rating: info.driverRating,
      phone: info.driverPhone,
      vehicleNumber: info.vehicleNumber,
      model: info.vehicleModel,
      brand: info.vehicleBrand,
      color: info.vehicleColor,
      driverLatitude: info?.driverLocaiton?.coordinates[1],
      driverLongitude: info?.driverLocaiton?.coordinates[0],
      driverUPIId: info?.driverLocaiton?.upiId,

    }),

    setDriverLatitude: (latitude) =>
      set({
        driverLatitude: latitude,
      }),

    setDriverLongitude: (longitude) =>
      set({
        driverLongitude: longitude,
      }),
    setDriverAngle: (angle) =>
      set({
        driverAngle: angle,
      }),

  clearDriverInfo: () =>
    set({
      driverName: '',
      driverPhoto: '',
      rating: null,
      phone: '',
      vehicleNumber: '',
      model: '',
      brand: '',
      color: '',
      driverLatitude: null,
      driverLongitude: null,
      driverAngle: null,
      driverMaxSpeed: null,
      }),
}));





const driver = {
  name: 'John Doe',
  rating: 4.8,
  photo: 'https://picsum.photos/id/237/200/300',
  otp: '4730',
};

const vehicle = {
  number: 'TN 01 AB 1234',
  brand: 'Maruti Suzuki',
  model: 'Swift Dzire',
  color: 'White',
  
};




export default useAssignedDriverInfoStore;