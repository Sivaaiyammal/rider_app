import DeviceInfo from 'react-native-device-info';
import dayjs from 'dayjs';
import { Platform } from 'react-native';
import { DataStore } from '../controllers/DataStore';
import SpInAppUpdates, {
  IAUUpdateKind,
  StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

// Show force update immediately; optional remains same-day
const OPTIONAL_UPDATE_DAYS = 0; // same day
const FORCE_UPDATE_DAYS = 0;    // force today (no skip)

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
    
    // Latest values from server payload (both Build Number and Version)
    const latestVersionRaw = Platform.select({ android: versions?.ANDROID?.VERSION, ios: versions?.IOS?.VERSION });
    const latestBuildRaw = Platform.select({ android: versions?.ANDROID?.BUILD_NUMBER, ios: versions?.IOS?.BUILD_NUMBER });

    // Current app values
    const currentVersionRaw = DeviceInfo.getVersion(); // e.g. "2.1.0.7"
    const currentBuildRaw = DeviceInfo.getBuildNumber(); // e.g. "120" (Android versionCode)

    // Normalize for comparison
    const latestVersion = normalizeVersion(latestVersionRaw);
    const latestBuild = normalizeVersion(latestBuildRaw);
    const currentVersion = normalizeVersion(currentVersionRaw);
    const currentBuild = normalizeVersion(currentBuildRaw);

    console.log('checkUpdateStatus currentVersion:', currentVersionRaw, 'normalized:', currentVersion);
    console.log('checkUpdateStatus latestVersion:', latestVersionRaw, 'normalized:', latestVersion);
    console.log('checkUpdateStatus currentBuild:', currentBuildRaw, 'normalized:', currentBuild);
    console.log('checkUpdateStatus latestBuild:', latestBuildRaw, 'normalized:', latestBuild);

    // Validate inputs: at least one of version/build must be valid to deem outdated
    const hasValidLatestVersion = Number.isFinite(latestVersion);
    const hasValidLatestBuild = Number.isFinite(latestBuild);
    if (!hasValidLatestVersion && !hasValidLatestBuild) {
      console.warn('[UpdateCheck] Invalid latest payload:', versions);
      return 'none';
    }

    // Determine outdated states per dimension
    const versionOutdated = hasValidLatestVersion && Number.isFinite(currentVersion) && currentVersion < latestVersion;
    const buildOutdated = hasValidLatestBuild && Number.isFinite(currentBuild) && currentBuild < latestBuild;

    // If neither is outdated, clear state and exit
    if (!versionOutdated && !buildOutdated) {
      await DataStore.storeData('firstOutdatedDate', null);
      return 'none';
    }

    // Outdated: get persisted state
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

    // Skip functionality removed: optional updates are no longer skippable
    console.log("firstOutdatedDate value", firstOutdatedDate);

    // With zero-day thresholds, any outdated state results in force update
    if (versionOutdated || buildOutdated) {
         const isDebug = false;
       const inAppUpdates = new SpInAppUpdates(isDebug);
       try{
       const result = await inAppUpdates.checkNeedsUpdate();


       const updateAvailability = result?.other?.updateAvailability || 1;
       if (updateAvailability === 1){
         return 'force';

       }
      }catch(e){
        console.log("InAppUpdates Error",e);
       
        return 'none';
      }
     
    }
    return 'none';
  } catch (e) {
    console.log('checkUpdateStatus error:', e);
    return 'none';
  }
}
