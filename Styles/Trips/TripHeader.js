import { StyleSheet, Dimensions } from 'react-native';


const TripHeaderStyles = StyleSheet.create({
    text: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold'
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
    },
    image: {  height: 16, width: 8 },
    imageContainer: {position: 'absolute', left: 0, top: -5,padding:10}

})

module.exports = {TripHeaderStyles}