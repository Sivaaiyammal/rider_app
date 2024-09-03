import { StyleSheet } from "react-native";

const earningStyle = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 100
    },

    text: {
        fontSize: 20,
        color: "#000",
        fontWeight: "bold",
    },

    button: {
        backgroundColor: "#000",
        padding: 10,
        borderRadius: 5,
        margin: 20,
    },

    buttonText: {
        fontSize: 20,
        color: "#fff",
    },

    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: 'black'
    },

    earningContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },

    earningBox: {
        backgroundColor: "#f2f2f2",
        padding: 10,
        borderRadius: 5,
        width: "30%",
    },

    selectedTabContainer: {
        backgroundColor: "#ffd100",
        padding: 10,
        borderRadius: 5,
        width: "30%",

    },  

    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: "#f2f2f2",
        borderRadius: 5,
    },

    dueContainer: {
        // flexDirection: "row",
        padding: 10,
        backgroundColor: "#2ec4b6",
        width: "100%",
        borderRadius: 10,
        height: 150,
        justifyContent: 'space-between'
    },
    
    earningText: {
        fontSize: 16, 
        fontWeight: 'bold', 
        padding: 5, 
        color: 'black'
    },

    earningDetailsText: {
        fontSize: 16, 
        fontWeight: 'bold', 
        padding: 10, 
        color: 'black'
    },
    dateSection: {
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121'
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f8f8',
        paddingVertical: 10,
        borderRadius: 10,
    },
    summaryBox: {
        alignItems: 'flex-start',
    },
    summaryTitle: {
        fontSize: 16,
        color: '#757575',
        paddingVertical: 5,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap:2
    },
    transactionText: {
        fontSize: 14,
        color: '#000',
        flex:1,
        // backgroundColor: 'red'

    },
    statsContainer: {
        // styles for the stats container
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        // padding: 10,
        flexWrap: 'wrap',
        backgroundColor: '#f8f8f8',
    },
    statBox: {
        // styles for each stat box
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        height: 150,
        margin: 2,
        backgroundColor: '#fff',
    },
    statNumber: {
        // styles for numbers in stat boxes
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121'
    },
    statLabel: {
        // styles for labels in stat boxes
        fontSize: 16,
        color: '#212121'
    },
});

module.exports = { earningStyle };