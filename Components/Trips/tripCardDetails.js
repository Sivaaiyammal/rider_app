import { Component } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// Images 
import DriverIcon from "../../Assets/Trips/tripDetails/driverIcon.svg";
import CarIcon from "../../Assets/Trips/tripDetails/carIcon.svg";
import LocationIcon from "../../Assets/Trips/tripDetails/locationMark.svg";

class TripCardDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {


        }
        this.tripDetails = this.props.tripDetails
        this.showTripDetails = this.props.showTripDetails
    }

    TimelineComponent () {

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5 }}>
                <Image source={locationIcon} style={{ width: 18, height: 22, marginRight: 10 }} />
                <Text style={{color: 'black'}}>{this.tripDetails.pickup || 'OTP : 123456'}</Text>
            </View>
        )

    }

    render() {

        const tripDetails = this.tripDetails

        return (
            <View onStartShouldSetResponder={() => true} onResponderGrant={() => {this.showTripDetails(true); console.log('jasdbfjsdgf')} } style={tripStyles.mainContainer}>
                <View style={tripStyles.headerRow}>
                    <View style={tripStyles.tripIdContainer}>
                        <Text style={tripStyles.tripIdText}>Trip ID: {tripDetails.id || "ABCDE123455"}</Text>
                    </View>

                    <View style={tripStyles.statusContainer}>
                        <Text style={tripStyles.statusText}>WAITING</Text>
                    </View>
                </View>
                
                <View style={tripStyles.dateContainer}>
                    {/* <Image style={{ width: 20, height: 20, marginRight: 10 }} /> */}
                    <Text style={tripStyles.dateText}>Today, 01 Jan 23, 10:00am</Text>
                </View>

                <View style={tripStyles.detailRow}>
                    <CarIcon style={[{ width: 18, height: 18 }, tripStyles.iconStyle]} />
                    <Text style={tripStyles.carRegText}>{tripDetails.carRegistration || 'TN 01 AB 1234'}</Text>
                </View>

                <View style={tripStyles.detailRow}>
                    <DriverIcon style={[tripStyles.iconStyle]} />
                    <Text style={tripStyles.driverText}>{tripDetails.driverName || 'Ezio Auditore'}</Text>
                </View>

                <View style={tripStyles.detailRow}>
                    <LocationIcon style={[tripStyles.iconStyle]} />
                    <Text style={tripStyles.driverText}>{tripDetails.destination || 'HCL_OMR'}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={tripStyles.otpContainer}>
                        <LocationIcon style={{ width: 18, height: 22, marginRight: 10 }} />
                        <Text style={{color: 'white', fontWeight: 'bold'}}>{tripDetails.pickup || 'OTP : 123456'}</Text>
                    </View>
                    <View style={tripStyles.callDriverContainer}>
                        <LocationIcon style={{ width: 18, height: 22, marginRight: 10 }} />
                        <Text style={{color: 'white', fontWeight: 'bold'}}>{tripDetails.drop || 'Call Driver'}</Text>
                    </View>
                </View>
            </View>
        )

    }

}

export default TripCardDetails;

const tripStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#fafafa',
        marginBottom: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5
    },
    headerRow: {
        flexDirection: 'row',
        borderRadius: 20,
        justifyContent: 'space-between'
    },
    tripIdContainer: {
        padding: 5,
        backgroundColor: '#303030',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    tripIdText: {
        color: '#fafafa'
    },
    statusContainer: {
        padding: 5,
        backgroundColor: '#ff8903',
        alignSelf: 'center',
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20
    },
    statusText: {
        color: '#FFF'
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10
    },
    dateText: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5
    },
    iconStyle: {
        marginRight: 10
    },
    carRegText: {
        color: 'black',
        fontWeight: 'bold'
    },
    driverText: {
        color: 'black'
    },
    destinationText: {
        color: 'black'
    },
    otpContainer: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#5347be',
        borderBottomLeftRadius: 20
    },
    callDriverContainer: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: "#62cc9e",
        borderBottomRightRadius: 20
    }
});