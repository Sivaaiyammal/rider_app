import { StyleSheet, Dimensions } from 'react-native';


const TripStyle = StyleSheet.create({
    container: {
        padding: 20,
        position: 'relative',
        backgroundColor: '#fafafa', 
        margin: 10, 
        borderRadius: 10, 
        borderColor: '#eeeeee', 
        borderWidth: 1
    },
    innerContainer: {
        width: "85%"
    },
    tripId: {
        fontSize: 12,
        fontWeight: "bold",
        color: 'black',
        marginBottom: 8
    },
    tripTime: {
        fontSize: 14,
        color: '#616161',
        marginBottom: 15

    },
    tripStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 10
    },
    tripStatsHeaderText: {
        fontSize: 12,
        color: '#212121'
    },
    tripStatsHeaderValueText: {
        fontSize: 14,
        color: 'black',
        fontWeight: 'bold',
        marginTop: 5
    },
    location: {
        flexDirection: "row",
        margin: 10,
    },
    locationImage: {
        height: 16,
        width: 16,
        marginRight: 10
    },
    locationText: {
        fontSize: 14,
        color: '#212121',
    },
    locationTimeText: {
        fontSize: 12,
        color: '#757575',
        marginTop: 5,

    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#deecfb',
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 10

    },
    buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#212121',
    },
    toggleIcon:{
        position: 'absolute',
        width: 12,
        height: 6,
    },
    toggleIconContainer:{
        position: 'absolute',
        right: 20,
        top: 20,
        padding: 10,
        alignItems:'center',
        justifyContent:'center',
        padding:15
    }

});

module.exports = { TripStyle }