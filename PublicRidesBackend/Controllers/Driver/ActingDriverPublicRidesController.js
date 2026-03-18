/* eslint-disable camelcase */
/* eslint-disable no-useless-escape */
const { driverPublicRidesVerifyOTPSchema  } = require("../../Schemas/DriverSchema")
const Driver = require("../../Models/Driver");
const Redis = require("../DB/Redis");

module.exports = function (CLASS) {
     CLASS.prototype.verifyPublicRidesADOTP = async function (req, res) {
        try {
            const platform = req?.query?.platform;
            const schema = driverPublicRidesVerifyOTPSchema(platform);
            const [payload, errRes] = await this.validate(req.body, schema);
            if (!payload) return res.status(400).json(errRes);
            const driverCheck = await Driver.checkDriverExistWithPhoneOrEmail(payload);
            const otp = await Redis.getData(payload.phone);
            if (!otp) return res.status(400).json({ success: false, message: 'OTP expired' });
            if (Number(otp) !== payload.otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
            await Redis.removeKey(payload.phone);
            if (driverCheck) {
                const driverDetails = await Driver.getDriverWithId(driverCheck._id);
                if (!driverDetails?.publicRidesDriver) return res.status(400).json({ success: false, message: 'Your Account Has Not Registered For Public Rides' });
                const token = await this.createDriverJWT({ driver: { id: driverCheck._id } }, process.env.JWT_SECRET_DRIVER, 'HS256');
                driverDetails.token = token;
                driverDetails.driverStatus= {status: 'online', updatedOn: new Date().getTime()} 
                driverDetails.isAvailable = true
                if (driverDetails.role !== 'acting_driver') {
                    await Driver.updateDriver(driverCheck._id, { role: 'acting_driver' });
                }
                // Set role based on vendor ID
                driverDetails.role = 'acting_driver';
                if (payload.fcmToken) {
                    // const driverDeviceImeiSet = new Set(driverDetails.fcmTokens?.map(fcmToken => fcmToken.deviceImei) || []);
                    // const driverFcmTokensSet = new Set(driverDetails.fcmTokens?.map(fcmToken => fcmToken.token) || []);
                    // if (!driverDeviceImeiSet.has(payload.fcmToken.deviceImei) || !driverFcmTokensSet.has(payload.fcmToken.token)) {
                    await Driver.updateDriverFcmToken(driverDetails._id, payload.fcmToken, payload.deviceMeta);
                    // }
                }
                return res.json({ success: true, message: 'OTP verified successfully', user: driverDetails });
            }
            delete payload.otp;
            payload.createdBy = "publicrides";
            payload.createdOn = new Date().getTime();
            payload.publicRidesDriver = true;
            payload.tripStatus = "NOTRIP"
            payload.role = "acting_driver"; // Set role as acting_driver for new driver
            const result = await Driver.addDriver(payload);
            const driverDetails = await Driver.getDriverWithId(result.insertedId);
            const token = await this.createDriverJWT({ driver: { id: driverDetails._id, publicRides: true } }, process.env.JWT_SECRET_DRIVER, 'HS256');
            driverDetails.token = token;
            if (payload.fcmToken) {
                // const driverDeviceImeiSet = new Set(driverDetails.fcmTokens?.map(fcmToken => fcmToken.deviceImei) || []);
                // const driverFcmTokensSet = new Set(driverDetails.fcmTokens?.map(fcmToken => fcmToken.token) || []);
                // if (!driverDeviceImeiSet.has(payload.fcmToken.deviceImei) || !driverFcmTokensSet.has(payload.fcmToken.token)) {
                await Driver.updateDriverFcmToken(driverDetails._id, payload.fcmToken, payload.deviceMeta);
                // }
            }
            return res.json({ success: true, message: 'OTP verified successfully', user: driverDetails });
        }catch (error) {
            return this.handleError(error, res);
        }
    }
}