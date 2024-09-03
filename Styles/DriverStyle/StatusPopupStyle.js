import { StyleSheet,Dimensions } from "react-native";

const GoOnlineStyle = StyleSheet.create({
    container:{
        backgroundColor:'#fff',
        paddingVertical:10,
        paddingHorizontal:15,
        borderRadius:8,
        alignItems:'center',
        justifyContent:'center',
        minWidth: 300
    },
    text:{
        color:'#212121',
        fontSize:16
    },
    buttonContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginVertical:15,
        width:280,
    },
    cancelBtn:{
        borderWidth:1,
        borderColor:'#ff4343',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#ffe5e5',
        borderRadius:5,
        width:135,
        height:40,
    },
    cancelBtnText:{
        color:'#ff4343',
        fontSize:16,
        
    },
    confirmBtn:{
        borderWidth:1,
        borderColor:'#299865',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#299865',
        borderRadius:8,
        width:135,
        height:40,
    },
    confirmBtnText:{
        color:'#fff',
        fontSize:16
    }
})
const GoOfflineStyle = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        minWidth: 300
    },
    text: {
        color: "#000",
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 16,
    },
    wrapper: {
        position: 'absolute',
        bottom: 50
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelBtn: {
        backgroundColor: '#D1FFBD',
        color: "#299865",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#299865",
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelBtnText: {
        color: '#299865',
        fontSize: 16,

    },
    confirmBtnText: {
        color: '#ff4343',
        fontSize: 16,
    },
    confirmBtn: {
        margin: 5,
        backgroundColor: '#ffe5e5',
        color: "#299865",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#ff4343",
        alignItems: 'center',
        justifyContent: 'center'
    }
})
const GoBreakStyle = StyleSheet.create({
    container:{
        backgroundColor:'red',
        padding:10,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    text:{
        color: "#000",
        textAlign: 'center',
        fontSize:16,
        marginBottom:10
    },
    selectTime:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    button:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5,
        backgroundColor:'#f5f5f5',
        height:32,
        width:90,
        borderColor: "yellow"
    },
    icon:{
        marginRight:5,
        height:16,
        width:18
    },
    duration:{
        color:"#212121",
        marginLeft: 5
    },
    cancelBtn:{
        borderWidth:1,
        borderColor:'#ff4343',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#ff4343',
        borderRadius:8,
        width:135,
        height:40,
    },
    confirmBtn:{
        borderWidth:1,
        borderColor:'#212121',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#212121',
        borderRadius:8,
        width:135,
        height:40,
    }
})

const statusControl = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: 'space-between',
    },
    containerCopy:{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex:99999
    }
})

// styling for popup arrow positioning

const styles = StyleSheet.create({
    statusInfoTab: {
        backgroundColor: 'red'
    },
    container: {
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: 'transparent',
        top: -40,
        left: "48%",
    },
    triangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 10,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#fff',
        transform: [{ rotate: '180deg' }],
        ...Platform.select({
            android: {
                elevation: 5, // Add elevation for box shadow on Android
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 1,
            },
        }),
    },
    statusContainer: {
        position: 'absolute',
        left: "38%",
        top: -68,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        ...Platform.select({
            android: {
                elevation: 5, // Add elevation for box shadow on Android
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
            },
        }),
    },
    statusText: {
        fontSize: 14,
        color: 'green',
    },
});

const homeStatusStyle = StyleSheet.create({
    allBtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 25,
        flex: 1,
    },
    button: {
        padding: 10,
        zIndex: 1,
        borderRadius: 50,
        marginBottom: 15
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#299865',
        padding: 10,
        zIndex: 1,
        borderRadius: 50,
    },
    icon: {
        height: 24,
        width: 24,
    },
    iconContainer: {
        padding: 5,
    },
    statusInfo: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 75,
        textAlign:'center',
        width:'100%',
    },
    statusInfoViewTab:{
        backgroundColor:'#fff',
        shadowColor: "#000", 
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,          
        shadowOffset: {
            width: 0,                  
            height: 1,                
        },
        alignItems:'center',
        justifyContent:'center',
        shadowOpacity: 0.2,           
        shadowRadius: 1.41,         

        // Shadow properties for Android
        elevation: 2,
    }
})


module.exports = {
    GoOnlineStyle,
    GoOfflineStyle,
    GoBreakStyle,
    statusControl,
    styles,
    homeStatusStyle
}