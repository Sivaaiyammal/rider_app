import { StyleSheet } from "react-native"

const upiStyles = StyleSheet.create({
    upiContainer: {
        backgroundColor: '#fafafa',
        marginHorizontal: 10,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginVertical:5
    },
    topBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    blueText: {
        color: "#2a3fff",
        fontWeight: '500',
        fontSize: 14
    },
    primaryStyle: {
        flexDirection: 'row',
        gap: 7,
        alignSelf: 'flex-start',
        alignItems: 'center'
    },
    greenText: {
        color: "#12881e",
        fontWeight: '400'
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent:'space-between',
        marginTop: 10
    },
    okBtn: {
        padding: 5,
        color: '#fff',
        backgroundColor: '#212121',
        height: 40,
        width: '10%',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        textAlign: 'center',
        alignItems: 'center'
    },
    input: {
        width: "90%",
        height: 40,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#eeeeee",
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    blueDotted:{
        flexDirection:'column',
        borderBottomWidth:1,
        borderStyle:'dotted',
        flexDirection: 'row',
        gap: 7,
        alignSelf: 'flex-start',
        alignItems: 'center',
        borderBottomColor:'#0080ff'
    }
})

module.exports = {upiStyles}