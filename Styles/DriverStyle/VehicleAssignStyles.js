import { StyleSheet } from "react-native";

const AssignVehicleStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    searchInput: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor:'#e0e0e0'
    },
    confirmBtn: {
        backgroundColor: '#212121',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 8,
        borderRadius: 8,
        width: 140,
        alignSelf: 'flex-end',
        marginTop:10
    },
    labelStyle: {
        fontSize: 14,
        width: '90%',
    },
    buttonWrapStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between', // this will create space between the label and the radio button
        alignItems: 'center',
        marginBottom: 10,
    },
    listLabel:{
        color:'#212121',
        fontSize:12
    },
    box: {
    },
    listItem:{
        borderWidth:1,
        borderColor:'#eeeeee',
        paddingHorizontal:3,
        paddingVertical:5,
        borderRadius:5
    }
});

const Notification = StyleSheet.create({
    container:{
        position:'absolute',
        top:10,
        width:"90%",
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor:'#257a41',
        padding:10,
        marginHorizontal:15,
        borderRadius:10,
        zIndex:999
    },
    info:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    okBtn:{
        backgroundColor:'transparent'
    }
})

const styles = StyleSheet.create({
    radioButton: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginVertical: 5,
        borderWidth:1,
        borderColor:'#DEDEDE',
        paddingHorizontal:10,
        paddingVertical:15,
        borderRadius:8,
    },
    selectedRadioButton:{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginVertical: 5,
        borderWidth:1,
        paddingHorizontal:10,
        paddingVertical:15,
        borderRadius:8,
        borderColor:'#6c63ff',
        backgroundColor:'#efeeff'
    },
    selectedRadioCircle:{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderColor:'#6c63ff'
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderColor:'#9e9e9e'
    },
    selectedRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6c63ff',
    },
    model:{
        color:'#757575',
    },
    selectedModel:{
        color:'#000',
    }
});


module.exports = {
    AssignVehicleStyle,
    Notification,
    styles
}