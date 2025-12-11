import InAppReview from 'react-native-in-app-review';

export const triggerInAppReview = async () => {
  try {
    const isAvailable = InAppReview.isAvailable();

    if (!isAvailable) {
      console.log('In-App Review not available on this device');
      return false;
    }

    const hasFlowFinishedSuccessfully = await InAppReview.RequestInAppReview();
    console.log('In-App Review flow finished successfully:', hasFlowFinishedSuccessfully);
    return hasFlowFinishedSuccessfully;
  } catch (error) {
    console.log('Error during In-App Review process:', error);
    return false;
  }
};
