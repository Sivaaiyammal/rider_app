import DeviceInfo from 'react-native-device-info';
import dayjs from 'dayjs';
import { Platform } from 'react-native';
import { DataStore } from '../controllers/DataStore';

// "Today optional, next day force"
const OPTIONAL_UPDATE_DAYS = 0; // same day
const FORCE_UPDATE_DAYS = 1;    // next day

/** Normalize to comparable integer.
 * "1.2.3" -> 1_002_003 ; "120" -> 120 ; 120 -> 120
 */
function normalizeVersion(input) {
  if (input == null) return NaN;
  const s = String(input).trim();
  if (s.includes('.')) {
    const [maj='0', min='0', pat='0'] = s.split('.');
    return (parseInt(maj,10)||0)*1_000_000
         + (parseInt(min,10)||0)*1_000
         + (parseInt(pat,10)||0);
  }
  return parseInt(s, 10);
}

export async function checkUpdateStatus(versions) {
  try {
    // Use build numbers (versionCode) if you can. If you pass "1.2.3", normalizeVersion handles it.
    const latestRaw = Platform.select({ android: versions?.android, ios: versions?.ios });
    const currentRaw = DeviceInfo.getBuildNumber(); // e.g. "120" (Android versionCode)

    const latest = normalizeVersion(latestRaw);
    const current = normalizeVersion(currentRaw);

    if (!Number.isFinite(latest)) {
      console.warn('[UpdateCheck] Invalid latest version:', latestRaw);
      return 'none';
    }

    // If up-to-date (or newer), clear state and exit
    if (Number.isFinite(current) && current >= latest) {
      await DataStore.storeData('firstOutdatedDate', null);
      // Optional: await DataStore.storeData('updateSkipDate', null);
      return 'none';
    }

    // Outdated: get persisted state
    const skipDateResponse = await DataStore.loadData('updateSkipDate', null);
    const skipDate = skipDateResponse?.data;
    
    const firstOutdatedResponse = await DataStore.loadData('firstOutdatedDate', null);
    let firstOutdatedDate = firstOutdatedResponse?.data;

    console.log("firstOutdatedDate", firstOutdatedResponse);

    // First time we noticed the app is outdated
    if (!firstOutdatedDate) {
      firstOutdatedDate = new Date().toISOString();
      await DataStore.storeData('firstOutdatedDate', firstOutdatedDate);
    }

    // Whole-day granularity: 0 today, 1 tomorrow, etc.
    const daysSinceOutdated = dayjs().diff(dayjs(firstOutdatedDate), 'day');

    console.log("daysSinceOutdated",daysSinceOutdated)

    // Optional should be skippable only for the current day
    const skippedToday = !!(
      skipDate && dayjs(skipDate).isSame(dayjs(), 'day')
    );

    console.log("skipDate", skipDate);
    console.log("firstOutdatedDate value", firstOutdatedDate);

    // Force ignores skip
    if (daysSinceOutdated >= FORCE_UPDATE_DAYS) return 'force';
    if (daysSinceOutdated >= OPTIONAL_UPDATE_DAYS && !skippedToday) return 'optional';
    return 'none';
  } catch (e) {
    console.log('checkUpdateStatus error:', e);
    return 'none';
  }
}
