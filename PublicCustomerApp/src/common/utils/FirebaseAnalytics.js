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
  logFirebaseEvent('NOT_screen', buildParams(category, action, other));

export const firebaseloglogin = (category, action, other = {}) =>
  logFirebaseEvent('NOT_login', buildParams(category, action, other));

export const firebaselog_CUS_trip = (category, action, other = {}) =>
  logFirebaseEvent('NOT_CUS_trip', buildParams(category, action, other));

export const firebaselog_CUS_plantrip = (category, action, other = {}) =>
  logFirebaseEvent('NOT_CUS_plantrip', buildParams(category, action, other));

export const firebaselog_CUS_trippayment = (category, action, other = {}) =>
  logFirebaseEvent('NOT_CUS_trippayment', buildParams(category, action, other));

export const firebaselog_DRI_trip = (category, action, other = {}) =>
  logFirebaseEvent('NOT_DRI_trip', buildParams(category, action, other));

export const firebaselog_DRI_duepay = (category, action, other = {}) =>
  logFirebaseEvent('NOT_DRI_duepay', buildParams(category, action, other));

export const firebaselog_DRI_onboarding = (category, action, other = {}) =>
  logFirebaseEvent('NOT_DRI_onboarding', buildParams(category, action, other));

export const firebaselog_DRI_status = (category, action, other = {}) =>
  logFirebaseEvent('NOT_DRI_status', buildParams(category, action, other));

export const firebaselog_networkevents = (category, action, other = {}) =>
  logFirebaseEvent('NOT_networkevents', buildParams(category, action, other));

export const firebaselog_routing = (category, action, other = {}) =>
  logFirebaseEvent('NOT_routing', buildParams(category, action, other));

export const firebaselog_language = (category, action, other = {}) =>
  logFirebaseEvent('NOT_language', buildParams(category, action, other));

export const firebaseRoleSelect = (category, action, other = {}) =>
  logFirebaseEvent('NOT_role_select', buildParams(category, action, other));