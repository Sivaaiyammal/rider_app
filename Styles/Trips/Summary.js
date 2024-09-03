import { StyleSheet } from 'react-native';

const tripDetailIcon = {
    width: "20",
    height: "20"
}

const profileIcon = {
    width: "100%",
    height: "100%"
}

const TripSummaryStyle = StyleSheet.create({
    amountCard:{
        backgroundColor:'#212121',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
        marginVertical:10,
        padding:10,
        margin:"5%"
    },
    map: {
        height: 300, width: "100%", marginBottom: 20
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 20,
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    headerText: {
        color: '#212121',
        fontWeight: 'bold'
    },
    headerTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dashedLine: {
        borderWidth: 1,
        borderColor: '#212121',
        borderStyle: 'dotted',
        borderBottomWidth: 0
    },
    dottedLine: {
        borderWidth: 1,
        borderStyle: 'dotted',
        width: 100,
        borderBottomWidth: 0
        // backgroundColor:'red'
    },
    tripId: {
        fontSize: 14,
        color: '#757575'
    },
    date: {
        fontSize: 16,
        marginTop: 8,
        fontWeight: 'bold',
        color:'#212121'
    },
    locations: {
        // padding: 20,
        backgroundColor: '#fff'
    },
    location: {
        position: 'relative',
        paddingLeft: 20,
        marginLeft: 30,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.1)',
        borderStyle: 'dashed',
        paddingTop: 0,
        paddingBottom: 20,
    },
    statusBox: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginRight: 10,
        rowGap: 22
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    waypointBox: {
        position: 'relative',
        paddingLeft: 20,
        marginLeft: 30,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.1)',
        borderStyle: 'dashed',
        paddingTop: 0,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    marker: {
        width: 18,
        height: 18,
        position: 'absolute',
        left: -7.9, top: 0
    },
    yourLocationMarker: {
        width: 18,
        height: 18,
        position: 'absolute',
        left: -13, top: -1
    },
    threeDots: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    markerContainer: {
        position: 'absolute',
        left: -10,
        top: 0,
        backgroundColor: '#4b1abf',
        height: 20,
        width: 20,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: "center"
    },
    markerContainerTwo: {
        position: 'absolute',
        left: -11,
        top: 0,
        height: 20,
        width: 20,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: "center"
    },
    StopCount: {
        position: 'absolute',
        left: -4.5,
        top: 2,
        fontWeight: '800',
        color: '#6f00ff',
        backgroundColor: 'transparent',
        fontSize: 12
    },
    MarkerCount: {
        position: 'absolute',
        left: -3,
        top: 1,
        fontSize: 10,
        fontWeight: '500',
        backgroundColor: 'transparent'
    },
    name: {
        color: "#212121",
        fontWeight:"bold",
        fontSize: 14,
        marginBottom: 5
    },
    time: {
        color: "#616161",
        fontSize: 14,
        // marginTop: 5,
        marginBottom:5

    },
    address: {
        fontSize: 16,
        color: "black",
        // marginTop: 5,
    },
    nameInfo: {
        fontSize: 16,
        color: "black",
        fontWeight: '500'
    },
    locationDetails: {
        marginTop: 16,
    },
    tripDetails: {
        flexDirection: 'row',
        flexWrap:'wrap',
        marginTop: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailRow: {
        minWidth: "15%",
        backgroundColor: 'rgba(0, 153, 255, 0.2)',
        margin: 5,
        // justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        color: '#212121',
        justifyContent: 'flex-start',
        minHeight: 50,
        flexDirection: 'column',
        // alignItems: 'center',
    },
    detailLabel: {
        color: '#212121',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        flex: 1,
    },
    tripDetailIcon: {
        width: 30, // Set a fixed width for the icon
        height: 30, // Set a fixed height for the icon
        resizeMode: 'contain', // Ensure the image scales properly within the bounds
        marginRight: 10,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 100,
        marginRight: 20
    },
    textArea: {
        height: 150,
        width: '100%',
        justifyContent: "flex-start",
        padding: 10,
        textAlignVertical: 'top', // This makes the placeholder and text appear at the top of the text area
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10
    },
    ratingContainer: {
        padding: 20
    },
    submitButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#237b53',
        borderRadius: 8,
        alignItems: 'center',
        width: 144,
        height: 40,
        alignSelf: 'flex-end'
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    homeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#2c3e50',
        borderRadius: 8,
        alignItems: 'center',
        width: 160,
        height: 40,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    employeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121'
    },
    markerExtra:{position:'absolute',top:1,zIndex:99,left:-3,fontSize:10,fontWeight:'bold'}
});

module.exports = { TripSummaryStyle, tripDetailIcon, profileIcon }
