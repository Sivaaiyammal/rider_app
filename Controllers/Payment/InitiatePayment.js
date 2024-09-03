import {
    CFCallback,
    CFErrorResponse,
    CFPaymentGatewayService,
} from 'react-native-cashfree-pg-sdk';
import {
    CFDropCheckoutPayment,
    CFEnvironment,
    CFSession,
    CFThemeBuilder,
} from 'cashfree-pg-api-contract';

// Function to initiate payment
export function initiatePayment(orderToken, orderId, environment = CFEnvironment.SANDBOX, themeConfig = null) {

    return new Promise((resolve, reject) => {

        try {
            const session = new CFSession(orderToken, orderId, environment);

            let theme;
            if (themeConfig) {
                theme = new CFThemeBuilder()
                    .setNavigationBarBackgroundColor(themeConfig.navigationBarBackgroundColor || '#E64A19')
                    .setNavigationBarTextColor(themeConfig.navigationBarTextColor || '#FFFFFF')
                    .setButtonBackgroundColor(themeConfig.buttonBackgroundColor || '#FFC107')
                    .setButtonTextColor(themeConfig.buttonTextColor || '#FFFFFF')
                    .setPrimaryTextColor(themeConfig.primaryTextColor || '#212121')
                    .setSecondaryTextColor(themeConfig.secondaryTextColor || '#757575')
                    .build();
            } else {
                // Default theme
                theme = new CFThemeBuilder()
                    .setNavigationBarBackgroundColor('#E64A19')
                    .setNavigationBarTextColor('#FFFFFF')
                    .setButtonBackgroundColor('#FFC107')
                    .setButtonTextColor('#FFFFFF')
                    .setPrimaryTextColor('#212121')
                    .setSecondaryTextColor('#757575')
                    .build();
            }

            const dropPayment = new CFDropCheckoutPayment(session, null, theme);
            CFPaymentGatewayService.doPayment(dropPayment);

            CFPaymentGatewayService.setCallback({
                onVerify(orderID) {
                    resolve(orderID)
                },
                onError(error, orderID) {
                    reject(error)
                },
            });



        } catch (e) {
            console.log(e.message);
            reject(e.message)
        }

    })

}
