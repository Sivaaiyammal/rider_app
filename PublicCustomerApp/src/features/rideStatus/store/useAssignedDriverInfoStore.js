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

  setDriverInfo: (info) =>
    set((state) => ({
      ...state,
      ...info,
    })),


  setDummyDriverInfo: () =>
    set({
      driverName: "John Doe",
      driverPhoto: "https://picsum.photos/id/237/200/300",
      rating: 4.8,
      phone: "9876543210",
      vehicleNumber: "TN 01 AB 1234",
      model: "Swift Dzire",
      brand: "Maruti Suzuki",
      color: "White",
      driverLatitude: 11.04180351593615,
      driverLongitude: 77.0430626347661,
      driverAngle: 0,
      driverMaxSpeed: 100,
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