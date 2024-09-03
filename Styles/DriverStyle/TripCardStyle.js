import { StyleSheet } from "react-native";

const tripStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#fafafa',
        marginBottom: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        borderRadius: 20,
        justifyContent: 'space-between'
    },
    tripIdContainer: {
        padding: 5,
        paddingHorizontal: 15,
        backgroundColor: '#303030',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    tripIdText: {
        color: '#fafafa'
    },
    statusContainer: {
        padding: 5,
        paddingHorizontal: 15,
        backgroundColor: '#ff8903',
        alignSelf: 'center',
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20
    },
    statusText: {
        color: '#FFF'
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10
    },
    dateText: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5
    },
    iconStyle: {
        marginRight: 10
    },
    carRegText: {
        color: 'black',
        fontWeight: 'bold'
    },
    driverText: {
        color: 'black'
    },
    destinationText: {
        color: 'black'
    },
    otpContainer: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#5347be',
        borderBottomLeftRadius: 20
    },
    callDriverContainer: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: "#62cc9e",
        borderBottomRightRadius: 20
    }
});

module.exports = {
    tripStyles
}