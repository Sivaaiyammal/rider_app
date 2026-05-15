const axios = require("axios");

class VehicleVerifierMParivahan {

    constructor() {
        this.MPARIVAHAN_RC_STAGING = 'https://vendorstest.vmmaps.com/appbackend/api/admin/rc-verification_other';
        this.MPARIVAHAN_RC = 'https://vendors.vmmaps.com/vmvendorsServer/api/admin/rc-verification_other'
    }

    async verfiyRC( vehicleId ) {
        const requestPayload = {
            "vehicleId": vehicleId
        }
        if (!process.env.PARIVAHAN_KEY) {
            return {
                valid: false,
                status: 'skipped',
                message: 'PARIVAHAN_KEY is not configured',
            };
        }

        try { 
            const response = await axios.post(this.MPARIVAHAN_RC, requestPayload, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.PARIVAHAN_KEY },
                timeout: 10000,
            });

            console.log('MParivahan RC verification response:', response.data.data);

            if (response?.data?.data?.status === 'success') {
                return {valid: true, data: response?.data?.data}
            } else {
                return {
                    valid: false,
                    status: response?.data?.data?.status,
                    message: response?.data?.data?.message || "MParivahan verification failed",
                }
            }
        } catch (error) {
            const status = error?.response?.status;
            const responseMessage = error?.response?.data?.message || error?.message || 'MParivahan request failed';
            console.error('RC verification failed:', status || 'no-status', responseMessage);
            return {
                valid: false,
                status: 'error',
                message: responseMessage,
                httpStatus: status,
            };
        }
    }
}

module.exports = new VehicleVerifierMParivahan();