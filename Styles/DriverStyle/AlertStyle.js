import { StyleSheet } from "react-native";

const AlertStyle = StyleSheet.create({
    container: {
        alignItems: 'center',  
    },
    waitingPopup: {
        backgroundColor: 'black', 
        borderRadius: 8,  
        padding: 15,  
        alignItems: 'center',  
        width: 200,  
        marginBottom:20
    },
    alertedPopup: {
        backgroundColor: '#FF4747',  
        borderRadius: 20, 
        paddingVertical:10,
        flexDirection: 'row',  
        alignItems: 'center', 
        justifyContent: 'center', 
        width: 280, 
    },
    waitingText:{
        fontSize:24,
        color:'#fff',
        fontWeight:'bold'
    }
})

const BottomStyle = {
    container: {
        backgroundColor:'#fff',
        flexDirection: 'column', 
        alignItems: 'center',  
        width:360,
        paddingHorizontal:10,
        paddingTop:10,
        borderRadius:10,
        paddingBottom:10,

    },
    realert: {
        flexDirection: 'row',    
        alignItems: 'center',  
        justifyContent: 'space-between',
        backgroundColor: '#eeeeee',  
        borderRadius: 8,  
        width:250,
        paddingHorizontal:5,
        paddingVertical:8,
        marginBottom:10,
        borderWidth:1,
        borderColor:'#bdbdbd'
    },
    iconWrapper:{
        flexDirection:'row',
        alignItems:"center",
    },
    icon:{
        marginRight:5
    },
    text:{
        color:'#bdbdbd'
    },
    timer:{
        color:'#ff4343',
        marginRight:5,
        fontSize:16
    },
    otpBox:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#212121',
        borderRadius: 8,  
        width:250,
        paddingHorizontal:5,
        paddingVertical:8,
        marginBottom:10,
        borderWidth:1,
        borderColor:'#212121'
    },
    realertBtn:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdf3f1',
        borderRadius: 8,  
        width:250,
        paddingHorizontal:5,
        paddingVertical:8,
        marginBottom:10,
        borderWidth:1,
        borderColor:'#ff4343'
    }
    
}


module.exports = {
    AlertStyle,
    BottomStyle
}