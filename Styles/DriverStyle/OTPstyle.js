import { StyleSheet } from "react-native"

const otpStyles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems:'center',
        paddingVertical:20,
        marginHorizontal:20,
    },
    reportContainer:{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding:10,
        alignItems:'center',
        maxWidth:"90%",
    },
    verifyOTP: {
        color: '#212121', textAlign: 'center', fontSize: 16, marginVertical: 10, fontWeight: 'bold',
    },
    verifyOTPbox: {
        flexDirection: 'column', textAlign: 'center', alignItems: 'center'
    },
    closeBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10
    },
    abortBtn:{
        alignItems:'center',
        justifyContent:'center',
        minHeight:40,
        backgroundColor:'red',
        minWidth:150,
        marginTop:10,
        height:140,
        width:150,
        borderRadius:70,
    }
})
const styles = StyleSheet.create({
    popupScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 999,
        alignItems: 'center'
    }
})
const noShowStyles = StyleSheet.create({
    reasonContainer: {
        padding: 5,
    },
    controls: {
        flexDirection: 'row',
        // padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        width:300
    },
    cancelBtn: {
        backgroundColor: '#eeeeee',
        width: 145,
        height:40,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: 8,
        borderRadius: 8
    },
    confirmBtn: {
        backgroundColor: '#237b53',
        width: 145,
        height:40,
        // marginLeft:3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    pickerStyle: {
        borderWidth: 1,       // Border width
        borderColor: '#000', // Border color
        borderRadius: 8,     // Border radius
        backgroundColor: '#fff', // Background color
        height: 40,         // Height
        paddingHorizontal: 10,  // Left and right padding
        marginBottom: 10,
        width:'auto'
    }
})
const Odometer = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        color: '#212121',
        fontSize: 14,
        marginBottom:5
    },
    text: {
        color: '#212121',
        fontSize: 15,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#bdbdbd',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 8,
        marginTop: 5
    },
    miniText: {
        fontSize: 10,
        marginBottom: 5,
        textAlign:'center'
    },
    captureBtn: {
        borderColor: '#ff5a92',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdf3f1',
        marginVertical: 10
    },
    blackCapture:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#212121',
        borderRadius:8,
        padding:10,
        gap:10,
        paddingHorizontal:20,
        marginTop:10
    },
    submitBtn:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#212121',
        borderRadius:8,
        padding:10,
        gap:10,
        paddingHorizontal:20,
        marginTop:10,
        alignSelf:'center',
        width:130,
        marginBottom:100
    },
    camera: {
        height: 12,
        width: 15,
        marginRight: 5
    },
    confirmBtn: {
        backgroundColor: '#212121',
        paddingHorizontal: 30,
        paddingVertical: 8,
        borderRadius: 8
    },
    btnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom:5
    },
    input: {
        borderWidth: 1,
        borderColor: '#d6d6d6',
        padding: 8,
        fontSize: 12,
        borderRadius:8,
        color:'#757575'
    },
})

const paymentStyles = StyleSheet.create({
    text:{ color: '#212121', marginVertical: 10, fontSize: 16, fontWeight: '500', textAlign: 'center' },
    btnText:{ color: '#fff', fontWeight: '500' },
    okayBtn:{backgroundColor:'#000',padding:10,borderRadius:8,paddingHorizontal:20}
})

module.exports = {
    otpStyles,
    styles,
    noShowStyles,
    Odometer,
    paymentStyles
}