import { StyleSheet } from "react-native";
import { colors, Fonts } from "../constants/constants";

export const yourRidesStyles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colors.white,
        gap: 10,
    },
    ridesContainerItems: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingHorizontal: 10,
    },
    ridesContainerItem: {
        width: '100%',
        minHeight: 100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginVertical:15,
        paddingHorizontal: 10,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey_xdark,
    },
    ridesContainerItemLeft: {
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 5,
    },
    ridesContainerItemRight: {
        width: 'max-content',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    ridesContainerItemImgs: {
        position: 'relative',

    },
    ridesContainerItemVehicleImg: {
        width: 120,
        height: 80,
        resizeMode: 'contain',
        marginRight: 10
    },
    ridesContainerItemDriverImg: {
        position: 'absolute',
        right: 0,
        bottom: 10,
        zIndex: 1,
        width: 50,
        height: 50,
        borderRadius: 1000,
        borderWidth: 1,
        borderColor: colors.white,
    },
    ridesContainerItemTitle: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: colors.black,
    },
    ridesContainerItemDesc: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: colors.grey_xxdark,
    },
    ridesContainerItemFare: {
        fontFamily: Fonts.semi_bold,
        fontSize: 24,
        color: colors.black,
        marginTop: 10,
    },
});
