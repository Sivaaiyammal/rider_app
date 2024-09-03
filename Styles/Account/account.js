import { StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const styles = StyleSheet.create({

    tripContainer: {
        backgroundColor: 'white',
        paddingBottom: 15,
    },
    tripHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20
    },
    tripHeaderBackBtn: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        // paddingLeft: 10,
        // paddingRight: 10,
        padding:10,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    tripHeaderText: {
        color: Colors.black,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    tripHeaderAlarmBtn: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 8,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    }, tripContent: { paddingLeft: 20, paddingRight: 20 },
    sizeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },

    profileImgContainer: {
        marginLeft: 8,
        height: 110,
        width: 110,
        borderWidth: 8,
        borderColor: 'white',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 200
    },
    profileImg: {
        height: 100,
        width: 100,
        borderRadius: 40,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    distanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    distanceItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    distanceItemImage: {

    },
    distanceItemText: {
        color: "#212121",
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 5
    },
    generalText: {
        color: "#757575",
        fontSize: 14,
        textAlign: 'center'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingVertical: 10,
        marginVertical: 5,
        backgroundColor: 'white',
    },
    profileItemImageContainer: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 50,
        marginRight: 20,
        width:'13%',
        aspectRatio:1,
        alignItems:'center',
        justifyContent:'center'
    },
    profileItemImage: {
        width: 20,
        height: 20,
    },
    profileItemHead: {
        color: '#757575',
        fontSize: 12
    },
    profileItemText: {
        color: "#212121",
        fontSize: 16,
        fontWeight: 'bold',
        maxWidth:240,
    },
    logOutBtnContainer: {
        borderColor: '',
        borderWidth: 1,
        borderRadius: 10,
        margin: 20,
    },
    progress: {
        position: 'absolute',
        left: 0,
        top: 0,
        borderRadius: 10,
    },
    track: {
        width: '80%',
        height: 50,
        backgroundColor: '#ffe8e8',
        borderRadius: 10,
        borderColor: '#ff3838',
        borderWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 10
    },
    thumb: {
        width: 50,
        height: 50,
        backgroundColor: 'f8cfcf',
        paddingHorizontal: 20,
        // backgroundColor: 'grey',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    text: {
        color: '#ff3838',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        position: 'absolute'

    },
    addDetailBtn:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#212121',
        borderRadius:8,
        paddingHorizontal:15,
        paddingVertical:5
    },
    detailContainer:{
        flexDirection:'row',
        paddingHorizontal:20,
        justifyContent:'space-between'
    }

});

module.exports = {
    styles
};