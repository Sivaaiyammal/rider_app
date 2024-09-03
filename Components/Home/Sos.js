import { TouchableOpacity } from 'react-native'
import React from 'react'

import SosNew from '../../Assets/SvgIcons/SosNew.svg'

import { StyleSheet } from 'react-native';
import NotificationManager from '../Notification/NotificationManager';

export default function Sos({showSOSpopup}) {
    return (
        <TouchableOpacity
            key={"sos"}
            onPress={() => NotificationManager.info('Long press for 3 Seconds to Activate SOS', 3000, 'bottom')}
            style={style.btn}
            delayLongPress={3000}
            onLongPress={() => showSOSpopup()}>
            <SosNew height={45} width={45} />
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    btn: {
        position: 'absolute',
        top: 75,
        left: 12,
        zIndex: 1,
        backgroundColor: '#fff',
        borderRadius: 50
    }
})