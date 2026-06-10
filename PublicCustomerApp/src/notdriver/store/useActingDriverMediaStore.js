import { create } from 'zustand';

const useActingDriverMediaStore = create(set => ({
  // pre-trip
  preTripPhotos: { front: null, rear: null, leftSide: null, rightSide: null },
  setPreTripPhotos: photos => set({ preTripPhotos: photos }),
  preTripDone: false,
  setPreTripDone: done => set({ preTripDone: done }),
  pendingNavOpen: false,
  setPendingNavOpen: v => set({ pendingNavOpen: v }),
  
  // pre-trip flow milestone states
  currentStage: 1,
  setCurrentStage: stage => set({ currentStage: stage }),
  isArrived: false,
  setIsArrived: arrived => set({ isArrived: arrived }),

  // dent photos (dynamic array — driver can add multiple)
  dentPhotos: [],
  setDentPhotos: photos => set({ dentPhotos: photos }),
  dentPhotosDone: false,
  setDentPhotosDone: done => set({ dentPhotosDone: done }),

  // odometer (single photo)
  odometerPhoto: null,
  setOdometerPhoto: photo => set({ odometerPhoto: photo }),
  odometerPhotoDone: false,
  setOdometerPhotoDone: done => set({ odometerPhotoDone: done }),

  // post-trip
  postTripPhotos: { front: null, rear: null, leftSide: null, rightSide: null },
  setPostTripPhotos: photos => set({ postTripPhotos: photos }),
  bills: [],
  setBills: bills => set({ bills }),
  postTripDone: false,
  setPostTripDone: done => set({ postTripDone: done }),

  // reset everything when trip ends
  reset: () => set({
    preTripPhotos: { front: null, rear: null, leftSide: null, rightSide: null },
    preTripDone: false,
    pendingNavOpen: false,
    currentStage: 1,
    isArrived: false,
    dentPhotos: [],
    dentPhotosDone: false,
    odometerPhoto: null,
    odometerPhotoDone: false,
    postTripPhotos: { front: null, rear: null, leftSide: null, rightSide: null },
    bills: [],
    postTripDone: false,
  }),
}));

export default useActingDriverMediaStore;

