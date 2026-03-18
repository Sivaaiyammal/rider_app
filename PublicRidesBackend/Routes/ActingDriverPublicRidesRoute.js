const express = require('express');
const Router = express.Router();

const DriverController = require('../Controllers/Driver/DriverController');
const { withTiming } = require('../Utils/timingLogger');

// const CheckUserAuthenticated = require('../MiddleWares/CheckUserAuthenticated');
const driverController = new DriverController()

Router.post('/verifyADOTP', withTiming(driverController, driverController.verifyPublicRidesADOTP))

module.exports = Router