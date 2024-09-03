import { Component } from 'react'
import APIRequest from './APIRequest'

class InitiateCall {
    constructor() {
    }

    async alert(employeeID){
        let payload = {
            "employee_id": employeeID,
            otp: false,
            alert: true
        }
        let apiRequest = new APIRequest()
        try {
            let response = await apiRequest.request('/api/ride/employee_trip_alert', "POST", payload)
            if (!response.status) {
                return false
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async call(fromMobileNo, toMobileNo, app) {
        let payload = {
            "from_id": fromMobileNo,
            "to_id": toMobileNo,
            "app": app
        }
        let apiRequest = new APIRequest()
        try {
            let response = await apiRequest.request('/api/ride/make_call', "POST", payload)
            if (!response.status) return false
            return true
        } catch (error) {
            console.log(error,'cannot initiate call')
            return false
        }

    }
}

export default InitiateCall