const axios = require("axios");

class VehicleVerifierMParivahan {

    constructor() {
        this.MPARIVAHAN_RC_STAGING = 'https://vendorstest.vmmaps.com/appbackend/api/admin/rc-verification_other';
        this.MPARIVAHAN_RC = 'https://vendors.vmmaps.com/vmvendorsServer/api/admin/rc-verification_other';
    }

    async verfiyRC(regNo) {
        if (!process.env.PARIVAHAN_KEY) {
            console.log('PARIVAHAN_KEY is not configured. Returning mock vehicle details for local testing.');
            return {
                valid: true,
                data: {
                    status: 'success',
                    maker_desc: 'TATA MOTORS LTD',
                    maker: 'TATA',
                    model: 'INDICA',
                    vehicle_class_desc: 'THREE WHEELER (PASSENGER)',
                    manufacturing_yr: '2022',
                    fuel_desc: 'DIESEL',
                    color: 'WHITE',
                    owner_name: 'TEST OWNER',
                    class: 'THREE WHEELER (PASSENGER)',
                    brand_name: 'TATA',
                    brand_model: 'INDICA',
                    registration_date: '2022-05-18T00:00:00.000Z',
                    fuel_type: 'DIESEL',
                    seating_capacity: '4',
                    cubic_capacity: '1400 cc',
                    message: 'Mock verification success'
                }
            };
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const url = isProduction ? this.MPARIVAHAN_RC : this.MPARIVAHAN_RC_STAGING;
        const requestPayload = { regNo };

        console.log(`[Parivahan] Calling ${isProduction ? 'production' : 'staging'} API for regNo: ${regNo}`);

        try {
            const response = await axios.post(url, requestPayload, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.PARIVAHAN_KEY },
                timeout: 15000,
            });

            const responseData = response.data;
            console.log('[Parivahan] Raw response:', JSON.stringify(responseData));

            // Support both { data: { status, ... } } and { status, ... } response shapes
            const d = responseData?.data || responseData;

            if (d?.status === 'success') {
                return { valid: true, data: d };
            } else {
                console.warn('[Parivahan] Verification not successful:', d?.status, d?.message);
                return {
                    valid: false,
                    status: d?.status,
                    message: d?.message || 'MParivahan verification failed',
                };
            }
        } catch (error) {
            const status = error?.response?.status;
            const responseBody = error?.response?.data;
            const responseMessage = responseBody?.message || error?.message || 'MParivahan request failed';
            console.error('[Parivahan] RC verification failed:', status || 'no-status', responseMessage, responseBody ? JSON.stringify(responseBody) : '');
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
