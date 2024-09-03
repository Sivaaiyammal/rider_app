import { StyleSheet } from "react-native"

export const container = { flex: 1 }

const Emergency = StyleSheet.create({
    GoBack: {
        color: 'red'
    },
    noContactContainer: {
        backgroundColor: '#DD5C71',
        padding: 20,
        borderRadius: 50,
        // marginHorizontal:20,
        alignSelf: 'center',
        marginTop: 100
    },
    addContactContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        fontSize: 20,
        marginTop: 20,
        color: '#212121'
    },
    desText: {
        textAlign: 'center',
        color: '#808080',
        marginHorizontal: 20,
        marginTop: 15
    },
    addContactBtn: {
        backgroundColor: '#DD5C71',
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 30
    },
    addMoreBtn: {
        backgroundColor: '#DD5C71',
        marginTop: 15,
        marginHorizontal:25,
        height:40,
        width:200,
        borderRadius: 25,
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'center'
    },
    contactContainer: {
        padding: 10,
    },
    contact: {
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderRadius: 8,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 3,
    },
    leftBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    name: {
        color: '#212121',
        fontSize: 16,
        fontWeight: '500'
    },
    phone: {
        color: '#808080',
        fontSize: 14,
    },
    icon:{
        marginRight:10,
    }
})

module.exports = { Emergency }