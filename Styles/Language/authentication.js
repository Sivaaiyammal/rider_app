import { StyleSheet } from "react-native";
import { Colors } from 'react-native/Libraries/NewAppScreen'

const AuthendicationStyles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
        width: "100%",
        justifyContent: 'space-between'
    },
    sizedBox: {
        padding: 3,
        width: 50,
        marginTop: 10,
        marginBottom: 20,

        backgroundColor: 'blue',
        height: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },
    inputContianer: {
        width: "100%",
        height: 48,
        borderColor: Colors.black,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 22
    },
    inputTitle: {
        fontSize: 16,
        fontWeight: "400",
        marginBottom: 12,
        marginVertical: 8,
        color: '#000'
    },
    requestBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 130,
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 10,
        color: 'white',
        borderRadius: 5
    },
    titleStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#000'
    },
    stepperTitleStyle: {
        fontWeight: 'bold',
        fontSize: 34,
        color: '#000'
    },
    stepperInputContianer: {
        width: "100%",
        height: 48,
        borderColor: `#4b48ab`,
        borderWidth: 0,
        borderBottomWidth: 1.5,
        marginTop: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 10
    },

})

module.exports = { AuthendicationStyles }