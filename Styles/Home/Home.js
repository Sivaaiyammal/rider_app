
import { StyleSheet } from 'react-native';
import { InstantTripsStyles } from './InstantTrips'
import { Colors } from 'react-native/Libraries/NewAppScreen'

const HomeScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        // paddingBottom: 80
    },
});

const locationInfoStyles = StyleSheet.create({
    addressContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 60,
        zIndex: 100,
        backgroundColor: "#ffffff",
        flexDirection: 'row',
        padding: 8,
        borderRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },

    addressProfileImage: {
        width: 40,
        height: 40,
        marginRight: 10
    },

    title: {
        color: '#757575',
        fontSize: 12,
        fontWeight: 'bold',
    },

    address: {
        color: "#212121",
        fontSize: 12,
        marginTop: 2,
    }

})

const MapIconsStyle = StyleSheet.create({
    container: {
        // flex: 1,
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 10,
        zIndex: 1,
        marginTop: 8,
    },

    icon: {
        height: 24,
        width: 24,
        padding: 10

    },
    iconContainer: {
        padding: 10,
        backgroundColor: 'white',
        // marginBottom: 18,
        borderRadius: 100,
        borderColor:'#f5f5f5',
        borderWidth:1
    },
    back_icon:{
        height: 10,
        width: 10,
        padding:10
    }
});

const bottomTabStyles = StyleSheet.create({
    container: {
        // position: 'absolute',
        // zIndex: 100,
        // bottom: 0,
        width: "100%",
        backgroundColor: 'white',
        padding: 10,
    },
    tripMenuContainer: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-start', 
        flexWrap:'wrap'     
    },
    tripMenuImageContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#e4f2fc',
        borderRadius: 10,
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    tripMenuImage: {
        width: 24,
        height: 24
    },
    menuText: {
        color: '#212529',
        textAlign: 'center',
        marginTop: 5,
        fontSize: 12,
        maxWidth: 64,
        flexWrap: 'wrap'
    },
    searchInputContianer: {
        width: "100%",
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
        paddingLeft: 22,
        backgroundColor: "#f5f5f5", 
        paddingLeft: 25, 
        borderRadius: 10, 
        borderColor: '#e0e0e0', 
        borderWidth: 1
    },
    searchImage: {
        width: 18,
        height: 18
    },
    rideMenuContainer: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    rideMenuImageContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#e4f2fc',
        borderRadius: 100,
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    rideMenuImage: {
        width: 24,
        height: 24
    },
})

const buttonStyles = StyleSheet.create({
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: 5,
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row', // Arrange children in a row
        alignItems: 'center', // Center items vertically
        justifyContent: 'center',
        paddingLeft: 30, // Adjust padding as needed
        paddingRight: 30,
        borderRadius: 5, // Add border radius for rounded corners
        height: 48,
        width: "40%",
        margin: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 10
    },
    LocatebuttonContainer:{
        flexDirection: 'row', 
        alignItems: 'center', // Center items vertically
        justifyContent: 'center',
        paddingLeft: 30, // Adjust padding as needed
        paddingRight: 30,
        borderRadius: 5, // Add border radius for rounded corners
        height: 48,
        width: "40%",
        margin: 10,
        backgroundColor: '#f2f2f2',
        borderTopWidth:0.3
    },
    sosButtonContainer: {
        flexDirection: 'row', // Arrange children in a row
        alignItems: 'center', // Center items vertically
        justifyContent: 'center',
        paddingLeft: 30, // Adjust padding as needed
        paddingRight: 30,
        borderRadius: 5, // Add border radius for rounded corners
        height: 48,
        width: "40%",
        margin: 10,
        backgroundColor: '#d85858',
        borderRadius: 10
    },
    buttonImage: {
        width: 20, // Set the image width
        height: 20, // Set the image height
        marginRight: 10, // Add spacing between image and text
    },
    buttonText: {
        color: '#212121', // Text color
        fontSize: 14, // Text font size
    },
    sosButtonText: {
        color: '#ffffff', // Text color
        fontSize: 14, // Text font size
    }
});


const HomeMenuStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        margin: 5,
        justifyContent: 'space-around',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 50,

    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: "#212529",
        fontSize: 14,
        marginTop: 5,
    }

});

const NoTripFoundStyles = StyleSheet.create({
    container: {
        backgroundColor: "#fdf3f1",
        margin: 10,
        padding: 10,
        borderRadius: 20,
        position: 'relative'
    },
    warningImage: {
        height: 14,
        width: 16
    },
    warningText: {
        color: '#db5749',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 7
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    warningInfo: {
        color: "#212121",
        fontSize: 12,
        marginTop: 5
    },
    notFoundImage: {
        width: 80,
        height: 80,
        position: 'absolute',
        right: 5,
        bottom: 0,
    },
    vehicleNotFound: {
        width: 80,
        height: 90,
        position: 'absolute',
        right: 15,
        bottom: 0,
    }
})


module.exports = {
    HomeScreenStyles,
    locationInfoStyles,
    MapIconsStyle,
    bottomTabStyles,
    buttonStyles,
    HomeMenuStyles,
    NoTripFoundStyles
}