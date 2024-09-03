import { StyleSheet } from "react-native";

const  InstantRideStyles = StyleSheet.create({
    btnContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        padding:5
    },
    declineBtn:{
        borderWidth:1,
        borderColor:'#ff4343',
        height:40,
        width:160,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'#f8ebf3'
    },
    declineText:{
        color:'#ff4343',
        marginLeft:10,
        fontWeight:'600',
    },
    moreDetailsBtn:{
        borderWidth:1,
        borderColor:'#0080ff',
        height:40,
        width:160,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'#ebf5ff'
    },
    moreDetailsText:{
        color:'#0080ff',
        fontWeight:'600'
    },
    buttonContainer:{
        padding:20,
        alignItems:'center',
        justifyContent:'center'
    }
})

module.exports = {
    InstantRideStyles,
}