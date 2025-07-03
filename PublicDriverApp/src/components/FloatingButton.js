/* eslint-disable react/no-children-prop */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

import {colors, Fonts} from '../constants/constants';

import Close from '../assets/image/svgIcons/close.svg';
import Break from '../assets/image/tabIcons/break.svg';
import Sleep from '../assets/image/tabIcons/sleep.svg';
import Online from '../assets/image/tabIcons/online.svg';
import useDriverStatusStore from '../store/useDriverStatusStore';
import StatusModal from './DriverStatusModal/StatusModal';
import { breakData } from '../constants/JsonData';

const FloatingButton = () => {
  const {driverStatus, setDriverStatus} = useDriverStatusStore();
  const [showPopUpIcons, setShowPopUpIcons] = useState(false);
  const [onlineModal, setOnlineModal] = useState(false);
  const [onOfflineModal, setOfflineModal] = useState(false);
  const [breakModal, setBreakModal] = useState(false);

  const [selectedBreak, setSelectedBreak] = useState(breakData[0]);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const translateY1 = useRef(new Animated.Value(50)).current;
  const translateY2 = useRef(new Animated.Value(50)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;

  const resetAnimationValues = () => {
    translateY1.setValue(50);
    translateY2.setValue(50);
    opacity1.setValue(0);
    opacity2.setValue(0);
  };

  const triggerAnimation = () => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(translateY1, {
          toValue: 0,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY2, {
          toValue: 0,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const togglePopUpIcons = () => {
    if (!showPopUpIcons) {
      resetAnimationValues();
    }
    setShowPopUpIcons(prev => !prev);
    triggerAnimation();
  };

  const updateStatus = (status) => {
    setDriverStatus(status);
    if (status === 'Online') {
      setOnlineModal(false)
      setIsTimerActive(false)
    } else if (status === 'Offline'){
      setOfflineModal(false);
      togglePopUpIcons();
    } else {
      setBreakModal(false);
      togglePopUpIcons();
      setIsTimerActive(true);
      setRemainingTime(selectedBreak.value)
    }
  };

  useEffect(() => {
    let interval = null;

    if (isTimerActive && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      setIsTimerActive(false);
      updateStatus('Online')
    }

    return () => clearInterval(interval);
  }, [isTimerActive, remainingTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const onBreakPress = (item) => {
     setSelectedBreak(item)
  }

  const renderOnlineModal = () => (
    <StatusModal
      isVisible={onlineModal}
      onClose={() => {
        setOnlineModal(false);
      }}
      rightBtnText={'Yes, Go Online'}
      leftBtnTxt={'Cancel'}
      successMessage={'Are you sure want to Go Online and ready to take trips'}
      animationType={'slide'}
      onRightPress={()=>updateStatus('Online')}
      status={'Online'}
    />
  );

  const renderOfflineModal = () => (
    <StatusModal
      isVisible={onOfflineModal}
      onClose={() => {
        setOfflineModal(false);
      }}
      rightBtnText={'Yes, Go Offline'}
      leftBtnTxt={'No, Be Online'}
      successMessage={'Are you sure want to Go Offline?'}
      animationType={'slide'}
      onRightPress={()=>updateStatus('Offline')}
      status={'Offline'}
    />
  );

  const renderBreakModal = () => (
    <StatusModal
      isVisible={breakModal}
      onClose={() => {
        setBreakModal(false);
      }}
      rightBtnText={'Confirm'}
      leftBtnTxt={'Cancel'}
      successMessage={'Select the break time you want'}
      animationType={'slide'}
      onRightPress={()=>updateStatus('Break')}
      status={'Offline'}
      children={
        <View style={styles.breakContainer}>
          {breakData.map((item)=> (
            <TouchableOpacity key={item.id}
            onPress={()=>onBreakPress(item)} 
            style={[styles.breakBtn,{
              backgroundColor:selectedBreak.id === item.id ? 
              colors.white : colors.grey,
              borderColor: selectedBreak.id === item.id ? 
              colors.yellow : colors.grey,
            }]}
            >
              {item.icon}
              <Text style={styles.duration}>{item.duration}</Text>
            </TouchableOpacity>
          ))}
        </View>
      }
    />
  );

  return (
    <>
      {showPopUpIcons && (
        <View style={styles.popUpIconsContainer}>
          <Animated.View
            style={{
              transform: [{translateY: translateY1}],
              opacity: opacity1,
            }}>
            <TouchableOpacity onPress={() => setBreakModal(true)} style={styles.popUpIcon}>
              <Break />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              transform: [{translateY: translateY2}],
              opacity: opacity2,
            }}>
            <TouchableOpacity
              onPress={() => setOfflineModal(true)}
              style={[styles.popUpIcon, {backgroundColor: colors.danger_red}]}>
              <Sleep />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      {!showPopUpIcons && (
        <View style={styles.popUpStatusContainer}>
          <View style={styles.popUpTextConatiner}>
            {driverStatus === 'Online' && (
              <Text style={styles.popUpText}>You are Online</Text>
            )}
            {driverStatus === 'Offline' && (
              <Text style={[styles.popUpText, {color: colors.danger_red}]}>
                You're currently Offline.{'\n'}
                <Text style={styles.popUpTextSmall}>
                  Please go Online when you're ready to take trips
                </Text>
              </Text>
            )}
             {driverStatus === 'Break' && (
              <TouchableOpacity onPress={()=>setOnlineModal(true)}>
              <Text style={[styles.popUpText,{color:colors.violet}]}>Break Time Ends in 
              <Text style={styles.timer}> {formatTime(remainingTime)}</Text>
              <Entypo name="cross" color={colors.danger_red} size={20}/></Text>
              </TouchableOpacity>
            )}
            <AntDesign name="caretdown" color={colors.white} size={18} />
          </View>
        </View>
      )}

      <View style={styles.floatingBtnContainer}>
        {showPopUpIcons ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.floatingBtn]}
            onPress={togglePopUpIcons}>
            <Close />
          </TouchableOpacity>
        ) : (
          <>
            {driverStatus === 'Online' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.floatingBtn,
                  {backgroundColor: colors.green_online},
                ]}
                onPress={togglePopUpIcons}>
                <Online />
              </TouchableOpacity>
            )}
            {driverStatus === 'Offline' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.floatingBtn,
                  {backgroundColor: colors.danger_red},
                ]}
                onPress={()=>setOnlineModal(true)}>
                <Sleep />
              </TouchableOpacity>
            )}
             {driverStatus === 'Break' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.floatingBtn,
                  {backgroundColor: colors.violet},
                ]}
                onPress={()=>setOnlineModal(true)}>
                <Break />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      {onlineModal && renderOnlineModal()}
      {onOfflineModal && renderOfflineModal()}
      {breakModal && renderBreakModal()}
    </>
  );
};

const styles = StyleSheet.create({
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 45,
    alignSelf: 'center',
    zIndex: 1,
  },
  floatingBtn: {
    height: 55,
    width: 55,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  popUpIconsContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  popUpIcon: {
    backgroundColor: '#7d5fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  popUpStatusContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  popUpTextConatiner: {
    alignItems: 'center',
  },
  popUpText: {
    backgroundColor: colors.white,
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 8,
    top: 7,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.green_online,
    textAlign: 'center',
  },
  popUpTextSmall: {
    fontFamily: Fonts.light,
    fontSize: 12,
    color: colors.grey_xxdark,
  },
  breakContainer:{
    flexDirection:'row',
    width:'100%',
    alignItems:'center',
    justifyContent:'space-evenly',
  },
  breakBtn:{
    paddingVertical:5,
    flexDirection:'row',
    gap:4,
    paddingHorizontal:4,
    borderRadius:8,
    borderWidth:1,
    alignItems:'center'
  },
  timer:{
    fontFamily:Fonts.semi_bold
  },
  duration:{
    fontFamily:Fonts.light,
    color:colors.black
  }
});

export default FloatingButton;
