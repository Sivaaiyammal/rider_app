import { StyleSheet } from "react-native";

const SocialStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 1,

    },
    iconButton: {
        width: 60, // Adjust the size as needed for your layout
        height: 60, // Adjust the size as needed for your layout
        borderRadius: 30, // Make it half of the width/height to create a circle
        backgroundColor: '#2785ff', // Background color of the button
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10, // Adjust the margin as needed
    }
})

const contactStyles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    detailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
        gap: 10
    },

    illustration: {
        width: '100%',
        height: 250, // Adjust as per your requirement
        resizeMode: 'contain',
    },
    contactSection: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    contactTitle: {
        fontSize: 16,
        marginBottom: 5,
    },
    contactInfo: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    actionButton: {
        padding: 10,
        backgroundColor: '#e0e0e0', // Placeholder color. Update as needed
        borderRadius: 5,
    },
});

module.exports = { SocialStyles, contactStyles }