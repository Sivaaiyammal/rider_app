
import { StyleSheet, Dimensions } from 'react-native';


const TripFilterStyle = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 10,
        marginLeft: 15,
        marginRight: 15,
    },
    icon: {
        width: 14,
        height: 16
    },
    text:{
        color: "#9e9e9e",
        fontSize: 16,
        paddingBottom: 5
    },
    selectedTab: {
        color: "black",
        borderBottomColor: "black",
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
        fontWeight: '500',
        paddingBottom: 5
    }

});

module.exports = { TripFilterStyle }