// utils/FirebaseAnalytics.js
import {getAnalytics, logEvent as firebaseLogEvent} from '@react-native-firebase/analytics';

const analyticsInstance = getAnalytics();

/**
 * Logs an event to Firebase Analytics.
 * @param {string} eventName - The name of the event.
 * @param {object} params - The parameters for the event.
 * @returns {Promise<void>}
 */
export const logFirebaseEvent = async (eventName, params = {}) => {
  try {
    await firebaseLogEvent(analyticsInstance, eventName, params);
    // console.log(`Firebase Analytics event logged: ${eventName}`);
  } catch (error) {
    // Optionally log error to console or error tracking service
    console.error('Firebase Analytics logEvent error:', error);
  }
};

// Helper to build params
const buildParams = (category, action, other = {}) => {
  const params = {};
  if (category) params.category = category;
  if (action) params.action = action;
  return { ...params, ...other };
};

// Event functions
export const firebaselogscreen = (category, action, other = {}) =>
  logFirebaseEvent('Screen_View(SV)', buildParams(category, action, other));

export const firebaselog_userRole = (category, action, other = {}) =>
  logFirebaseEvent('User_Role_UR', buildParams(category, action, other));

export const firebaselog_userLogin = (category, action, other = {}) =>
  logFirebaseEvent('User_Login_UL', buildParams(category, action, other));

export const firebaselog_language = (category, action, other = {}) =>
  logFirebaseEvent('Language_L', buildParams(category, action, other));

export const firebaselog_onBoarding = (category, action, other = {}) =>
  logFirebaseEvent('Onboarding_OB', buildParams(category, action, other));

export const firebaselog_tripBooking = (category, action, other = {}) =>
  logFirebaseEvent('Trip_Booking_TB', buildParams(category, action, other));

// export const firebaselog_DRI_duepay = (category, action, other = {}) =>
//   logFirebaseEvent('On_Ride_OR', buildParams(category, action, other));

// export const firebaselog_DRI_onboarding = (category, action, other = {}) =>
//   logFirebaseEvent('Trip_Payment_TP', buildParams(category, action, other));

// export const firebaselog_DRI_status = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_DRI_status', buildParams(category, action, other));

// export const firebaselog_networkevents = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_networkevents', buildParams(category, action, other));

// export const firebaselog_routing = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_routing', buildParams(category, action, other));

// export const firebaseRoleSelect = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_role_select', buildParams(category, action, other));
