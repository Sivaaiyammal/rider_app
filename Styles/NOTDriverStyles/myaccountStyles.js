import { StyleSheet } from "react-native";

const myaccountStyles = StyleSheet.create({
    boxContainer:{
    },
    scrollContainer: {
        padding: 5,
    },
    target:{
        margin:5
    },
    logoutBtn:{flexDirection:'row',alignItems:'center',gap:10,alignSelf:'flex-start',position:'absolute',left:20,bottom:130},
    logoutText:{color:'#ff0000',fontSize:16,fontWeight:'500'},

})

module.exports = {myaccountStyles}