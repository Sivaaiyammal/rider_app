const express = require('express');
const Router = express.Router();

const DriverController = require('../Controllers/Driver/DriverController');
const { withTiming } = require('../Utils/timingLogger');
const CheckDriverAuthenticated = require('../MiddleWares/CheckDriverAuthenticated');

const driverController = new DriverController()

Router.post('/verifyADOTP', withTiming(driverController, driverController.verifyPublicRidesADOTP))
Router.post('/updateDrivingExperience', CheckDriverAuthenticated, withTiming(driverController, driverController.updateDrivingExperience))

module.exports = Router