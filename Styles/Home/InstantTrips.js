import { StyleSheet } from 'react-native';


const InstantTripsStyles = StyleSheet.create({
    instantTripCreateContainer: {
        position: 'relative',
        flex: 1,
    },
    instantTripCreateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: 15,
        width: "100%",
        paddingLeft: 25,
        paddingRight: 25,

    },
    instantTripCreateHeaderText: {
        color: 'black',
        fontWeight: "bold"
    },
    mapStyle: {
        flex: 1,
        width: "100%",
    },
    instantTripLocationInputsContainer: {
        position: 'absolute',
        top: 70,
        width: "100%",
        flex: 1
    },
    instantTripLocationInputContainer: {
        backgroundColor: 'white',
        padding: 10,
        marginLeft: 25,
        marginRight: 25,
        borderRadius: 10,
        elevation: 5,
        position: 'relative',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        position: 'relative',
    },
    instantTripCreateHeaderInput: {
        color: 'black',
        width: "80%",
        paddingLeft: 10,
        paddingTop: 20,
        paddingBottom: 0
    },
    instantTripCreateConfirmBtn: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        left: 10,
        backgroundColor: '#212121',
        color: "white",
        paddingLeft: 30,
        paddingRight: 30,
        width: "auto",
        height: "auto",
        paddingTop: 15,
        paddingBottom: 15,
    },

    instantTripCreateInputIcon: {
        height: 20,
        width: 18,
        paddingRight: 10
    },

    inputLabel: {
        position: 'absolute',
        top: 10,
        left: 40
    }

})

const searchForDriverStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: "100%",
        height: 250,
        backgroundColor: 'white',
        zIndex: 200,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16
    },
    subText: {
        color: "black",
        fontSize: 14,
        marginBottom: 50
    }
})


module.exports = {
    InstantTripsStyles,
    searchForDriverStyle
}