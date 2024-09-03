import { StyleSheet } from "react-native";
import { Colors } from 'react-native/Libraries/NewAppScreen';

const TripSheet1 = StyleSheet.create({

    tripContainer: {
        backgroundColor: 'white'
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
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
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
        justifyContent: 'center'
    }, tripContent: { paddingLeft: 20, paddingRight: 20 },
    sizeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    tripWorkingDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10
    },
    tripNextBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 80,
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 6,
        color: 'white',
        borderRadius: 5
    },
    tripNextBtnContainer: {
        padding: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    nextBtnArraow: {
        color: 'white',
        fontSize: 24,
        position: 'absolute',
        top: -4.5,
        right: 0
    }
});

const TripSheet2 = StyleSheet.create({
    overViewContainer: {
        padding: 20,
        backgroundColor: 'white',
        justifyContent: 'space-between'
    },
    rowView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: Colors.black,
    },
    headerTitle: {
        color: Colors.black,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bellButton: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 8,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 20,
    },
    generalText: {
        fontFamily: 'Arial',
        color: 'black',
        fontSize: 15,
        paddingLeft: 10,
    },
    separatorLine: {
        marginTop: 20,
        borderColor: '#f5f5f5',
        borderWidth: 1,
    },
    locationRow: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
    },
    dashedLine: {
        borderColor: '#d6d6d6',
        height: 30,
        borderLeftWidth: 1,
        borderStyle: 'dashed',
        marginLeft: 7,
    },
    mapStyle: {
        height: 200,
        marginTop: 20,
    },
    confirmButtonContainer: {
        padding: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    confirmButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 150,
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 6,
        color: 'white',
        borderRadius: 5,
    },
    confirmButtonText: {
        color: 'white',
    },
});

const TripSheet3 = StyleSheet.create({
    mainContainer: {
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20,
        margin: 10,
        borderRadius: 10,
        backgroundColor: '#fafafa',
        borderColor: "#eeeeee",
        borderWidth: 1
    },
    approvalContainer: {
        padding: 10,
        backgroundColor: "#ffe4dc",
        borderRadius: 5,
        width: 170
    },
    approvalText: {
        color: '#ff7043'
    },
    dateText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 20
    },
    generalRow: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        gap: 10
    },
    generalText: {
        fontFamily: 'Arial',
        color: 'black',
        fontSize: 15
    },
    separator: {
        marginTop: 20,
        borderColor: '#f5f5f5',
        borderWidth: 1
    },
    locationContainer: {
        marginTop: 20,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    locationRow: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center'
    },
    locationImage: {
        height: 15,
        width: 15,
        paddingRight: 10
    },
    dashedLine: {
        borderColor: '#d6d6d6',
        height: 30,
        borderLeftWidth: 1,
        borderStyle: 'dashed',
        marginLeft: 7
    },
    cancelContainer: {
        marginTop: 20
    },
    cancelButton: {
        padding: 10,
        backgroundColor: "#ffe4dc",
        borderRadius: 5,
        width: 80,
        alignItems: 'center'
    }
});

const tripModel = StyleSheet.create({
    modelText: {
        fontWeight: 'bold',
        color: Colors.balck,
        alignItems: 'center',
        textAlign: 'center'
    },
    modelTrackbtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "50%",
        marginTop: 20
    },
    btnContainer: {
        backgroundColor: '#237b53',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    }

});

const lightThemeStyles = StyleSheet.create({
    TripSheet1: {

        tripContainer: {
            backgroundColor: 'white'
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
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center'
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
            justifyContent: 'center'
        }, tripContent: { paddingLeft: 20, paddingRight: 20 },
        sizeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
        tripWorkingDayContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 10
        },
        tripNextBtn: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: 80,
            alignItems: 'center',
            backgroundColor: 'black',
            padding: 6,
            color: 'white',
            borderRadius: 5
        },
        tripNextBtnContainer: {
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-end'
        },
        nextBtnArraow: {
            color: 'white',
            fontSize: 24,
            position: 'absolute',
            top: -4.5,
            right: 0
        }
    },
    TripSheet2: {
        overViewContainer: {
            padding: 20,
            backgroundColor: 'white',
            justifyContent: 'space-between'
        },
        rowView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        backButton: {
            borderColor: "#e0e0e0",
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        backButtonText: {
            fontSize: 24,
            color: Colors.black,
        },
        headerTitle: {
            color: Colors.black,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        bellButton: {
            borderColor: "#e0e0e0",
            borderWidth: 1,
            padding: 8,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dateText: {
            color: Colors.black,
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 20,
        },
        generalText: {
            fontFamily: 'Arial',
            color: 'black',
            fontSize: 15,
        },
        separatorLine: {
            marginTop: 20,
            borderColor: '#f5f5f5',
            borderWidth: 1,
        },
        locationRow: {
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center',
        },
        dashedLine: {
            borderColor: '#d6d6d6',
            height: 30,
            borderLeftWidth: 1,
            borderStyle: 'dashed',
            marginLeft: 7,
        },
        mapStyle: {
            height: 200,
            marginTop: 20,
        },
        confirmButtonContainer: {
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        confirmButton: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: 150,
            alignItems: 'center',
            backgroundColor: 'black',
            padding: 6,
            color: 'white',
            borderRadius: 5,
        },
        confirmButtonText: {
            color: 'white',
        },
    },
    TripSheet3: {
        mainContainer: {
            padding: 10,
            margin: 10,
            borderRadius: 10,
            backgroundColor: '#fafafa',
            borderColor: "#eeeeee",
            borderWidth: 1
        },
        approvalContainer: {
            padding: 10,
            backgroundColor: "#ffe4dc",
            borderRadius: 5,
            width: 170
        },
        approvalText: {
            color: '#ff7043'
        },
        dateText: {
            color: Colors.black,
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 20
        },
        generalRow: {
            flexDirection: 'row',
            marginTop: 10
        },
        generalText: {
            fontFamily: 'Arial',
            color: 'black',
            fontSize: 15
        },
        separator: {
            marginTop: 20,
            borderColor: '#f5f5f5',
            borderWidth: 1
        },
        locationContainer: {
            marginTop: 20,
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        locationRow: {
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center'
        },
        locationImage: {
            height: 15,
            width: 15,
            paddingRight: 10
        },
        dashedLine: {
            borderColor: '#d6d6d6',
            height: 30,
            borderLeftWidth: 1,
            borderStyle: 'dashed',
            marginLeft: 7
        },
        cancelContainer: {
            marginTop: 20
        },
        cancelButton: {
            padding: 10,
            backgroundColor: "#ffe4dc",
            borderRadius: 5,
            width: 80,
            alignItems: 'center'
        }
    },
    tripModel: {
        modelText: {
            fontWeight: 'bold',
            color: Colors.balck,
            alignItems: 'center'
        },
        modelTrackbtn: {
            flexDirection: 'row',
            alignItems: 'center',
            width: "50%",
            marginTop: 20
        },
        btnContainer: {
            backgroundColor: '#237b53',
            padding: 10,
            borderRadius: 5,
            flex: 1,
            marginRight: 10,
        }

    }

})

const darkThemeStyles = StyleSheet.create({
    TripSheet1: {

        tripContainer: {
            backgroundColor: 'white'
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
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center'
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
            justifyContent: 'center'
        }, tripContent: { paddingLeft: 20, paddingRight: 20 },
        sizeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
        tripWorkingDayContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 10
        },
        tripNextBtn: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: 80,
            alignItems: 'center',
            backgroundColor: 'black',
            padding: 6,
            color: 'white',
            borderRadius: 5
        },
        tripNextBtnContainer: {
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-end'
        },
        nextBtnArraow: {
            color: 'white',
            fontSize: 24,
            position: 'absolute',
            top: -4.5,
            right: 0
        }
    },
    TripSheet2: {
        overViewContainer: {
            padding: 20,
            backgroundColor: 'white',
            justifyContent: 'space-between'
        },
        rowView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        backButton: {
            borderColor: "#e0e0e0",
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        backButtonText: {
            fontSize: 24,
            color: Colors.black,
        },
        headerTitle: {
            color: Colors.black,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        bellButton: {
            borderColor: "#e0e0e0",
            borderWidth: 1,
            padding: 8,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dateText: {
            color: Colors.black,
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 20,
        },
        generalText: {
            fontFamily: 'Arial',
            color: 'black',
            fontSize: 15,
        },
        separatorLine: {
            marginTop: 20,
            borderColor: '#f5f5f5',
            borderWidth: 1,
        },
        locationRow: {
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center',
        },
        dashedLine: {
            borderColor: '#d6d6d6',
            height: 30,
            borderLeftWidth: 1,
            borderStyle: 'dashed',
            marginLeft: 7,
        },
        mapStyle: {
            height: 200,
            marginTop: 20,
        },
        confirmButtonContainer: {
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        confirmButton: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: 150,
            alignItems: 'center',
            backgroundColor: 'black',
            padding: 6,
            color: 'white',
            borderRadius: 5,
        },
        confirmButtonText: {
            color: 'white',
        },
    },
    TripSheet3: {
        mainContainer: {
            padding: 10,
            margin: 10,
            borderRadius: 10,
            backgroundColor: '#fafafa',
            borderColor: "#eeeeee",
            borderWidth: 1
        },
        approvalContainer: {
            padding: 10,
            backgroundColor: "#ffe4dc",
            borderRadius: 5,
            width: 170
        },
        approvalText: {
            color: '#ff7043'
        },
        dateText: {
            color: Colors.black,
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 20
        },
        generalRow: {
            flexDirection: 'row',
            marginTop: 10
        },
        generalText: {
            fontFamily: 'Arial',
            color: 'black',
            fontSize: 15
        },
        separator: {
            marginTop: 20,
            borderColor: '#f5f5f5',
            borderWidth: 1
        },
        locationContainer: {
            marginTop: 20,
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        locationRow: {
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center'
        },
        locationImage: {
            height: 15,
            width: 15,
            paddingRight: 10
        },
        dashedLine: {
            borderColor: '#d6d6d6',
            height: 30,
            borderLeftWidth: 1,
            borderStyle: 'dashed',
            marginLeft: 7
        },
        cancelContainer: {
            marginTop: 20
        },
        cancelButton: {
            padding: 10,
            backgroundColor: "#ffe4dc",
            borderRadius: 5,
            width: 80,
            alignItems: 'center'
        }
    },
    tripModel: {
        modelText: {
            fontWeight: 'bold',
            color: Colors.balck,
            alignItems: 'center'
        },
        modelTrackbtn: {
            flexDirection: 'row',
            alignItems: 'center',
            width: "50%",
            marginTop: 20
        },
        btnContainer: {
            backgroundColor: '#237b53',
            padding: 10,
            borderRadius: 5,
            flex: 1,
            marginRight: 10,
        }

    }

})

module.exports = {
    TripSheet1,
    TripSheet2,
    TripSheet3,
    tripModel,
    lightThemeStyles,
    darkThemeStyles
}