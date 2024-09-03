import { View, Text, TextInput, Image, StyleSheet } from 'react-native';

const searchStyle = StyleSheet.create({
    container: {
        position: 'absolute', top: 50, left: 0, right: 0, zIndex: 3000,
        backgroundColor: 'white',
        marginLeft: 25,
        marginRight: 25,
    },

    bottom: {
        top: 140,
    },

    searchItem: {
        padding: 10,
    }
});

module.exports = { searchStyle }