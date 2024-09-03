
import { StyleSheet, Dimensions } from 'react-native';


const { width, height } = Dimensions.get('window')


const LanguageSCreenStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 100,
        backgroundColor: '#2785ff',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        position: 'relative',
    },

    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 24

    },

    version: {
        fontSize: 15,
        paddingTop: 10,
        color: 'black'

    },

    backgroundImage: {
        height: 600,
        width: 400,
        position: 'absolute',
        bottom: -50,
        right: 0,
    },

    radioContainer: {
        flexDirection: 'column',
        padding: 10,
        justifyContent: 'space-between',
    },

    ButtonContianer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 10,
        color: 'white',
        width: "100%",
        borderRadius: 5,
    },

    buttonTextStyle: {
        color: 'white',
        fontSize: 24,
        position: 'absolute',
        top: -4.5,
        right: 0,
    },

    btnMainContainer: {
        padding: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        width: 130
    },

    // scrollView: {
    //     height: '100%',
    // },
    
    conntentContanier: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        backgroundColor: '#fafafa', 
        marginBottom: 10, 
        padding: 20, 
        borderRadius: 5,
        rowGap: 10,
        columnGap: 10,
        width: "100%",
        display: 'flex',
        // flexWrap: 'wrap',
    },
    confirmBtn:{
        position:'absolute',
        backgroundColor:'#212121',
        bottom:10,
        right:10,
        height:40,
        width:150,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8
    },

    confirmBtnText:{
        color:'#fff',
        fontSize:18
    },

    contentStyles:{ color: 'black', flexWrap: 'wrap', display: 'flex', width: "80%", marginHorizontal: 10 },

    nextStyles:{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, width: "100%", position: 'absolute', bottom: 0 },

    overallContainer:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 100, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }
});

module.exports = { LanguageSCreenStyles }