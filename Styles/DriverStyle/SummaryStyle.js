import { StyleSheet } from "react-native"

const TripDetailsStyles = StyleSheet.create({
    container:{

    },
    infoBoxContainer:{
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'center',
        justifyContent:'center',
        rowGap:10,
        columnGap:10,
        marginTop:10
    },
    infoBox:{
        paddingVertical:15,
        paddingHorizontal:10,
        backgroundColor:'red',
        width:110,
        borderRadius:5
    },
    infoTitle:{
        marginTop:3,
        color:'#808080'
    },
    infoText:{
        fontSize:14,
        color:"#212121",
        marginTop:5,
        fontWeight:'600'
    },
    userContainer:{
        marginTop:10,
    },
    singleUser:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:5
    },
    name:{
        color:'#212121',
        fontWeight:'600',
        fontSize:16,
        marginBottom:3
    },
    firstBox:{
        flexDirection:'row',
        alignItems:'center'
    },
    ratingBox:{
        flexDirection:'row',
        alignItems:'center'
    },
    profileContainer:{
        padding:10
    },
    contactContainer:{
        flexDirection:'row',
        alignItems:'center',
        gap:5,
    },

})

module.exports ={
    TripDetailsStyles
}