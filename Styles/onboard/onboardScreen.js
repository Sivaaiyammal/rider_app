
import { StyleSheet, Dimensions } from 'react-native';


const { width, height } = Dimensions.get('window')

const onbaordScreenStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    lottie: {
        width: width * 1,
        height: 200,
        resizeMode: "contain",
        alignSelf: 'center'
    },
    lottie1: {
        width: width * 1,
        height: 300,
        resizeMode: "contain",
        alignSelf: 'center'
    },
    title: {
        fontFamily: "SofiaPro-SemiBold",
        fontSize: 24,
        fontWeight: "600",
        color: 'black',
        textAlign: 'center',
        fontWeight: "bold",
        lineHeight: 40
    },
    titleContainer: {
        padding: 3,
        width: 50,
        marginTop: 10,
        backgroundColor: 'yellow',
        height: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: "flex"
    }
});

module.exports = { onbaordScreenStyle }