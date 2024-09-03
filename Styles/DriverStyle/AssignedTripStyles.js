import { StyleSheet } from "react-native";

const AssignedTripStyles = StyleSheet.create({
    container: {
        position: 'relative',
        backgroundColor: 'transparent',
        padding: 10
    },
    headerContainer: {
        backgroundColor: '#fff',
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: 0,
        padding: 10,
        width: "100%"
    },
    headingText: {
        textAlign: 'center',
        left: 80,
        color: '#212121',
        fontSize: 16
    },
    icon: {
        height: 20,
        width: 20
    }
})
const TripCard = StyleSheet.create({
    container: {
        // backgroundColor: 'white',
        // width:"85%",
        // margin:5,
        // borderRadius: 10,
        // padding: 15,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 2,
        // elevation: 3,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    overallInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 10
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

const rideStarted = StyleSheet.create({
    startVerification: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        borderColor: '#299865',
        backgroundColor: '#299865',
        borderWidth: 1,
        width: 185,
        height: 40,
        fontSize: 12,
        borderRadius: 8,
        gap: 5,
        marginBottom:30
    },
    btnContainer: {
        alignItems: 'center',
        justifyContent: "center",
        marginBottom: 40
    },
    rideVerified: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
        gap: 5
    },
    employeePopup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        // backgroundColor:'red',
        height: 65,
        width: 105,
        borderRadius: 8,
        borderWidth:1,
        borderColor:"#f5f5f5",
        position:'absolute',
        top:15,
        right:32,
        backgroundColor:'#fff'
    },
    popup:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 8,
        borderWidth:1,
        borderColor:"#f5f5f5",
        position:'absolute',
        top:15,
        right:22,
        backgroundColor:'#fff',
        paddingHorizontal:10,
        paddingVertical:5
    }
})

const WaypointsStyles = StyleSheet.create({
    reportTripBtn: {
        alignItems: 'center',
        justifyContent: "center",
        borderColor: '#ff4343',
        borderWidth: 1,
        width: 170,
        height: 40,
        fontSize: 12,
        borderRadius: 8,
        marginBottom:30,
    },
    btnContainer: {
        alignItems: 'center',
        justifyContent: "center",
        marginBottom: 40
    },
    timerBtn:{
        flexDirection:'row',
        alignItems:"center",
        justifyContent:'center',
        gap:10,
        backgroundColor:'#bdbdbd',
        borderWidth:1,
        borderRadius:8,
        borderColor:'#bdbdbd',
        height:50,
        width:'80%',
        marginHorizontal:40,
        marginBottom:20
    }
})

const Verification = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
    },
    title: {
        color: '#212121',
        fontWeight: '600',
        marginVertical: 10
    },
    escort: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
        borderRadius: 8,
        padding: 10
    },
    employeeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
        borderRadius: 8,
        padding: 10,
        marginTop: 10
    },
    employeeProfile: {
        height: 40,
        width: 40,
        marginLeft: 10,
        marginRight: 8,
    },
    count: {
        backgroundColor: '#03a3ff',
        height: 20,
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50
    },
    employeeName: {
        fontWeight: '600',
        fontSize: 16
    },
    btnContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 10,
        marginVertical: 10
    },
    navigationBtn: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 170,
        borderRadius: 8
    }
})




module.exports = {
    AssignedTripStyles,
    TripCard,
    rideStarted,
    WaypointsStyles,
    Verification,
}