import { StyleSheet } from "react-native";

const flexStyle = StyleSheet.create({
    acjc: {
        alignItems: "center",
        justifyContent: "center",
    },
    acjsb: {
        alignItems: "center",
        justifyContent: "space-between",
    },

    frjsb: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    frjse:{
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    
    fr: {
        flexDirection: "row",
    },
    frg5:{
        flexDirection: "row",
        gap: 5,
        alignItems:'center'
    },
    frg10:{
        flexDirection: "row",
        gap: 10,
        alignItems:'center'
    },
    ac:{
        alignItems:"center"
    },
    jc: {
        justifyContent: "center",
    },
    fw: {
        flexWrap: 'wrap'
    },
    g5:{
        gap:5
    }
})


module.exports = {flexStyle}