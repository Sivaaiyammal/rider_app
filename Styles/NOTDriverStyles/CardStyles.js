import { StyleSheet } from "react-native";

const card = StyleSheet.create({
    card: {
        backgroundColor: '#58C5FD',
        borderRadius: 8,
        padding: 10,
        paddingHorizontal:15,
        height:150,
        justifyContent:'center',
        margin:10
    },
    firstRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    secondRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop:20
    },
    name: {
        color: '#212121',
        fontSize: 18,
        fontWeight: 'bold'
    },
    bankIcon:{
        marginRight:20,
    },
    text:{
        color:'#106296',
        fontSize:16,
        fontWeight:'500',
        fontStyle:'italic'
    }
})

module.exports = {card}