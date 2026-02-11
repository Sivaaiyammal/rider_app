











const User = require('../Models/User')

const PassangerPublicRidesRoute = require('./PassangerPublicRides')
const DriverPublicRidesRoute = require('./DriverPublicRides')
const generatePresignedUrlRoute = require('./secureserver/PresignedURL')

const PublicRidesPaymentRoutes = require('./PublicRidesPayments')
const VendorPublicRidesRoute = require('./VendorPublicRides')






const includeParams = () => (req, res, next) => {
    req.useNotPushNotification = true
    next()
}

module.exports = (app) => {
    // app.use('/location', LocationRoute)
    // app.use('/user', UserRoute)
    // app.use('/group', GroupRoute)
    // app.use('/user/device', DeviceRoute)
    // app.use('/user/group', GroupRoute)
    // app.use('/user/geofence', GeofenceRoute)
    // app.use('/user/alerts', AlertsRoute)
    // app.use('/user/ridegroup', RideGroupRoute)
    // app.use('/user/passanger', PassangerRoute)
    // app.use('/services', ServicesRoute)
    // app.use('/user/toll', TollRoute)
    // app.use('/user/trip', TripRoute)
    // app.use('/user/gpstools', GpsToolsRoute)

    // //drivers routes
    // app.use('/user/driver', DriverRoute)

    // // Admin routes
    // app.use('/admin', AdminRoute)

    // /* Secure Server Routes */

    // app.use('/secureserver/device', SecureServerDeviceRoute)

    app.use('/secureserver/presignedurl', generatePresignedUrlRoute)
    // /* Later remove from here and add it into seperate file */
    // app.post('/gService/notifications', async (req, res) => {
    //     try {
    //         const data = req.body?.message?.data
    //         const decodedStringData = Buffer.from(data, "base64").toString("ascii")
    //         const decodedData = JSON.parse(decodedStringData)
    //         console.log(decodedData)
    //         const { subscriptionNotification, packageName } = decodedData
    //         console.log(subscriptionNotification, packageName)
    //         const { purchaseToken, notificationType } = subscriptionNotification

    //         if (notificationType === GPubSubSubscriptionTypes.SUBSCRIPTION_RENEWED) {
    //             /*
    //             {"productId":"vmtrackers_subscription_elite_autorenew","expiryTime":"2024-09-21T01:12:30.842Z","autoRenewingPlan":{"autoRenewEnabled":true},"offerDetails":{"basePlanId":"elite-monthly-autorenew","offerId":"vmtrackers-subscription-elite-autorenew-free-trial"}}
    //             */
    //             const gResponse = await SubscriptionVerifier.verifySubscription({ packageName, token: purchaseToken });
    //             const user = await User.getUserFromPurchaseToken(purchaseToken)

    //             if (!user) {
    //                 console.log("User not found", purchaseToken)
    //                 return res.status(200).json({ success: false, message: 'Invalid subscription response' });
    //             }

    //             /* If no user found that means the user is removed from DB */
    //             /* Later log this in a file */
    //             if (!user) return res.status(200).json({ success: false, message: 'Invalid subscription response' });

    //             await User.updateUserSubscriptionRenewal(user._id, gResponse, new Date(gResponse.expiryTime).getTime())
    //             return res.status(200).json({ success: true, message: 'User Subscription Added' });
    //         } else {
    //             return res.status(200).json({ success: true, message: 'User Subscription Added' });
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500).send({ success: false })
    //     }
    // })


    /* PUBLIC RIDES SECTIONS */
    app.use('/publicrides/customer', PassangerPublicRidesRoute)
    app.use('/publicrides/driver', DriverPublicRidesRoute)
    app.use('/publicrides/customer/v2', includeParams(), PassangerPublicRidesRoute)
    app.use('/publicrides/driver/v2', includeParams(), DriverPublicRidesRoute)
    app.use('/publicrides/payments', PublicRidesPaymentRoutes)
    app.use('/publicrides/vendor', VendorPublicRidesRoute)
    // app.use('/invoices', InvoicesRoute)
    // app.use('/admin/invoice-settings', InvoiceSettingsRoute)
    // app.use('/airtel', AirtelRoute)

    // // Dev API (user)
    // app.use('/dev', DevRoute)
    // // Alias under /user/dev to match staging base path usage
    // app.use('/user/dev', DevRoute)
    // // Admin Dev API
    // app.use('/admin/dev', AdminDevRoute)
    // // External Developer APIs
    // app.use('/api', ExternalApiRoute)
}
