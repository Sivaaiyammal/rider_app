// utils/FirebaseAnalytics.js
import analytics from '@react-native-firebase/analytics';

/**
 * Logs an event to Firebase Analytics.
 * @param {string} eventName - The name of the event.
 * @param {object} params - The parameters for the event.
 * @returns {Promise<void>}
 */
export const logFirebaseEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    // Optionally log error to console or error tracking service
    console.warn('Firebase Analytics logEvent error:', error);
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
  logFirebaseEvent('User_Role(UR)', buildParams(category, action, other));

export const firebaselog_userLogin = (category, action, other = {}) =>
  logFirebaseEvent('User_Login(UL)', buildParams(category, action, other));

export const firebaselog_language = (category, action, other = {}) =>
  logFirebaseEvent('Language(L)', buildParams(category, action, other));

export const firebaselog_onBoarding = (category, action, other = {}) =>
  logFirebaseEvent('Onboarding(OB)', buildParams(category, action, other));

export const firebaselog_DRI_trip = (category, action, other = {}) =>
  logFirebaseEvent('Trip_Booking(TB)', buildParams(category, action, other));

export const firebaselog_DRI_duepay = (category, action, other = {}) =>
  logFirebaseEvent('On_Ride(OR)', buildParams(category, action, other));

export const firebaselog_DRI_onboarding = (category, action, other = {}) =>
  logFirebaseEvent('Trip_Payment(TP)', buildParams(category, action, other));

// export const firebaselog_DRI_status = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_DRI_status', buildParams(category, action, other));

// export const firebaselog_networkevents = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_networkevents', buildParams(category, action, other));

// export const firebaselog_routing = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_routing', buildParams(category, action, other));

// export const firebaseRoleSelect = (category, action, other = {}) =>
//   logFirebaseEvent('NOT_role_select', buildParams(category, action, other));
