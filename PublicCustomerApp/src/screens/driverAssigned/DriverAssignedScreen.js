import React, { useEffect , useState} from 'react';
import DriverArrival from './DriverArrival';
import OnRide from './OnRide';
import useRideSelectionStore from '../../store/useRideSelectionStore';
const DriverAssignedScreen = () => {
  const [onRide, setOnRide] = useState(false);
  const {rideStatus} = useRideSelectionStore();
  useEffect(() => {
    if(rideStatus == 'STARTED'){
      setOnRide(true);
    }
  }, [rideStatus])

  return <>{onRide ? <OnRide /> : <DriverArrival />}</>;
};

export default DriverAssignedScreen;
