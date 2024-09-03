import { StyleSheet } from "react-native";

const AgreementStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        alignSelf: 'center',
        color: '#212121'
    },
    content: {
        padding: 10
    },
    introContent: {
        fontWeight: '500',
        color: '#212121',
        marginTop: 10,
        marginBottom: 15
    },
    description: {
        marginBottom: 20,
        lineHeight: 22,
        color: '#212121',
    },
    instructionsTitle: {
        color: '#B65FCF',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 5
    },
    rules: {
        color: '#212121',
        fontWeight: '400',
        margin:5,
    },
    getStartedBtn:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:5,
        height:40,
        backgroundColor:'#000',
        alignSelf:'flex-end',
        width:150,
        borderRadius:8,
        marginBottom:30
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        left: -5,
        marginBottom: 10,
        color: '#212121',
    },
    label: {
        // margin: 8,
        marginVertical: 10,
        // fontSize:12,
        color: '#212121',
    },
    footer:{
        color: '#212121',
        margin: 0,
        padding: 0,
    },
    newTitle:{
        fontWeight:'bold',
        color:'#212121'
    }
});

module.exports = {
    AgreementStyles,
}