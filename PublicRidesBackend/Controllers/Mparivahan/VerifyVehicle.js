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
            console.log('PARIVAHAN_KEY is not configured. Returning mock vehicle details for local testing.');
            return {
                valid: true,
                data: {
                    status: 'success',
                    // Keys for PublicRidePassangerController
                    maker_desc: 'TATA MOTORS LTD',
                    maker: 'TATA',
                    model: 'INDICA',
                    vehicle_class_desc: 'THREE WHEELER (PASSENGER)',
                    manufacturing_yr: '2022',
                    fuel_desc: 'DIESEL',
                    color: 'WHITE',
                    owner_name: 'TEST OWNER',
                    
                    // Keys for VerifiedForm.jsx and Driver app
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