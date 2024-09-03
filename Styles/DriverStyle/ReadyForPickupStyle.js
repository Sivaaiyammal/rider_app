import { StyleSheet } from "react-native";

const TripPassenger = StyleSheet.create({
    container:{
        flexDirection:'row',
        alignItems:'center',
        // paddingTop: 15,
        // paddingBottom: 10
        // justifyContent:'space-between',
    },
    passengerInfo:{
        padding:10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap: 20,
        width:"100%",
        textAlign: 'center',
    },
    profileImg:{
        height:50,
        width:50
    },
    profilePicContainer:{
        // position:'relative',
        flexDirection:'row',
        // minWidth:5,
        marginHorizontal: 15,
        // paddingHorizontal: 20,
        
       
    },
    passengerBox:{
        // position:'absolute',
        // left:0,
        // top:-25
        // backgroundColor: 'yellow',
    },
    markerContainer:{
        position:'relative',
        bottom:10,
        left:15,
        height:20,
        width:20,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:50
    },
    marker:{
        color:'#ffff',
        fontSize:10,
    },
    pickedUp:{
        height:10,
        width:10
    },
    passengerContactInfo:{
        flexDirection:'row',
        alignItems:'center',
        gap:7
    },
    iconContainer:{
        // marginLeft:2,
        // borderRadius:50,
        // padding:8
    },
    contactIcon:{
        height:35,
        width:35
    },
    passengerDetail:{
        // marginLeft:80
        // textAlign: 'center',
    },
    name:{
        color:'#03a3ff',
        fontWeight:'bold'
    },
    status:{
        color:'#ff9900'
    }

})
const Pickup = StyleSheet.create({
    container:{
        flexDirection:'row',
        padding:5,
        alignItems:'center',
        justifyContent:'center'
    },
    text:{
        backgroundColor:'#FFDF77',
        color:'#212121',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:5,
        marginRight:10,
        borderRadius:5
    }

})
const PopupScreen = StyleSheet.create({
    popupScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex:10000,
    },    
    popupContainer:{
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        width:'90%',
        maxWidth: 400
    },
    title:{
        color: '#212121',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    alertBtn:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdf3f1',
        borderColor: '#ff4343',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        // marginVertical: 10,
        width:250,
        marginTop:5
    },
    alertText:{
        color: '#ff4343',
        fontWeight: '500',
        marginLeft: 10,
        fontSize: 16,
    },
    enterOTPbtn:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#212121',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        // marginVertical: 10,
        width:250,
        marginTop:10

    },
    enterOTPtext: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    callText:{
        marginLeft: 10,
        fontSize: 16,
        color:'green',
        fontWeight:'500'
    },
    icon: {
        width: 15,
        height: 15,
    },
    separatorContainer: {
        // flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    separator: {
        fontSize: 18,
        fontWeight: '500',
        color: '#9e9e9e',
        marginHorizontal: 10, // Space between the text and the horizontal lines
    },
    separatorLine: {
        width:70,
        height: 1, // This will determine the thickness of the line
        backgroundColor: '#d0d0d0', // Color of the line
    },
    borderLine:{
        height:1,
        backgroundColor:'#f5f5f5',
        marginBottom:8,
    }
})

module.exports = {
    TripPassenger,
    Pickup,
    PopupScreen
}