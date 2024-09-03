import { StyleSheet } from "react-native";

const upcomingStyles = StyleSheet.create({
    tripBox:{
        margin:10,
        borderRadius:8,
        borderWidth:1,
        borderColor:'#e0e0e0',
        backgroundColor:'#fcfcfc',
        padding:10
    },
    Topbox:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-evenly',
        paddingTop:10
    },
    miniBox:{

    },
    upperText:{
    },
    container: {
        marginHorizontal: 10
    },
    wrapper: {
        marginTop: 20,
    },
    profile: {
        alignSelf: 'center',
        marginTop: 10
    },
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 10
    },
    nameText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
        marginBottom: 5
    },
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 15,
        marginBottom: 10
    },
    rideVerifiedText: {
        color: '#299865',
        fontSize: 16,
    },
    rideInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 15,
        padding: 10
    },
    cashText: {
        color: '#299865',
        position: 'absolute',
        top: 10,
        right: 0,
        fontSize: 16,
        fontWeight: '600'
    },
    paymentText: {
        color: '#000',
        fontSize: 16,
    },
    buttonContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        columnGap:20,
        marginTop:10
    },
    btn:{
        borderRadius:8,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        columnGap:10,
        backgroundColor:'#212121',
        paddingVertical:10,
        paddingHorizontal:20,
        borderWidth:1,
        borderColor:'#212121'
    }
})

module.exports = {upcomingStyles}