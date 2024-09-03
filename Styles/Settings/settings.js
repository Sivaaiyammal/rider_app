import { StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 10
    },
    header: {
        width: '100%',
        padding: 5,
        marginBottom: 15,
        justifyContent: 'center',
        backgroundColor: '#fff',

        alignItems: 'center'
    },
    headerText: {
        color: '#212121',
        fontSize: 20
    },
    children: {
        rowGap: 10,
        width: '100%',
        // backgroundColor: '#fafafa',
        borderRadius: 15,
        columnGap: 5,
        marginBottom: 100,
    },
    subChild: {
        width: '100%',
        backgroundColor: '#fafafa',
        borderRadius: 15,
        columnGap: 10,
        paddingVertical: 8,
    },
    cardF:{
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',        
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card:{
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',        
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardIcon: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '10%'
    },
    cardNext: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        width: '10%',
        columnGap: 5
    },
    cardBody: {
        head: {
            // fontWeight: 'bold',
            fontSize: 16,
            color: '#212121'
        },
        container: {
            display: 'flex',
            marginHorizontal: 5,
            flex: 1,
            justifyContent: 'center',
        },
        subject: {
            fontSize: 14,
            color: '#616161'
        }
    },
    themeButtons: {
        container: {
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            columnGap: 5,
            // width: '30%',
            flex: 1
        },
        buttons: {
            borderRadius: 10,
            padding: 8
        }

    }
});

const IconSize = {
    width: 20,
    height: 20
}

module.exports = { styles , IconSize }