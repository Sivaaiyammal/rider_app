import { StyleSheet } from "react-native";

const HomeControl = StyleSheet.create({
    container:{
        width:"100%",
        position:"relative",
        zIndex:9,
        bottom:0,
        height:'15%',
        backgroundColor:"#fff",
        backgroundColor:'red',
        flexDirection:'row',
        alignItems:"center",
        justifyContent:'space-between',
        borderTopLeftRadius:25,
        borderTopRightRadius:25,
    },
    buttonImage:{
        width: 24,
        height: 24
    },
    buttonText:{
        color: '#212529',
        textAlign: 'center',
        marginTop: 5
    },
    buttonContainer:{
        alignItems:"center",
        justifyContent:"center",
        width:200,
        height:50,
        width:"50%",
    },
    statusButton:{
        position:'absolute',
        top:"-20%",
        left:"50%",
        // transform: [{ translateX: -50 }, { translateY: -50 }]
    },
    statusImg:{
        width:24,
        height:24,
    },
    active:{
        backgroundColor:"#299865"
    }
})


const DriverStatusStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 140,
        top: -235,
        padding: 10,
        zIndex: 1,
    },

    icon: {
        height: 30,
        width: 30,
        padding: 10

    },
    iconContainer: {
        padding: 10,
        backgroundColor: 'blue',
        marginBottom: 18,
        borderRadius: 100,
    }
});
module.exports = {
    HomeControl,
    DriverStatusStyle
}