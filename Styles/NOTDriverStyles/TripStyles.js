import { StyleSheet } from "react-native";

const TripscreenStyles = StyleSheet.create({
    container: {
    },
    btnBox: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 7,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#eeee',
        padding: 10,
        marginHorizontal: 10
    },
    text: {
        color: '#212121',
        fontSize: 16
    },
    count: {
        backgroundColor: '#ffd100',
        borderRadius: 50,
        height: 20,
        width: 20,
        textAlign: 'center',
        color: '#000'
    },
    tripBox: {
        margin: 15,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eeeeee"
    },
    dateInfo: {
        color: '#000',
        fontSize: 16,
        fontWeight: "500"
    },
    tripInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        marginTop: 5
    },
    tripId: {
        color: "#757575",
        fontWeight: '400'
    },
    details: {
        color: '#212121',
        fontWeight: '500'
    },
    borderLine: {
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 1,
        marginVertical: 5,
        position: 'relative'
    },
    dottedLine:{
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 1,
        marginVertical: 5,
        position: 'relative',
        borderStyle:'dashed',
        width:"90%",
        alignSelf:'center'
    },
    tripInfoBox: {
        padding: 5
    },
    arrowRight: {
        position: 'absolute',
        right: 10,
        top: '50%',
    },
    reportContainer:{
        flexDirection:'row',
        flexWrap:'wrap',
        width:'62%',
        padding:15,
        margin:10,
    },
    tripInfoText:{
        fontSize:16,
        color:'#212121',
        fontWeight:'600',
        marginTop:3
    },
    chartContainer:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }
})

module.exports = {TripscreenStyles}