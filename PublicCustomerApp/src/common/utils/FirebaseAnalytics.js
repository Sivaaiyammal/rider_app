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
