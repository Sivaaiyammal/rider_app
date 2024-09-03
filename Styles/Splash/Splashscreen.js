
import { StyleSheet, Dimensions } from 'react-native';



const splashScreenStyle = StyleSheet.create({
    container: {
        flex:1,
        // paddingTop: 90,
        // paddingLeft: 20,
        // paddingRight: 20,
        // position: 'relative',
    },

    subcontainer: {
        paddingTop: 90,
        paddingHorizontal: 20
    },

    title: {
        fontSize: 25,
        fontWeight: 'bold',
        paddingTop: 10,
        color: 'black'

    },

    version:{
        fontSize: 15,
        paddingTop: 10,
        color: 'black'
    
    },

    backgroundImage: {
        height:600,
        width:400,
        position: 'absolute',
        bottom: -50,
        right: 0,
    }
});

module.exports = {splashScreenStyle}