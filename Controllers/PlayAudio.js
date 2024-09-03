import { Text, View } from 'react-native'
import React, { Component } from 'react'
import Sound from 'react-native-sound';

import audio from '../Assets/audio/success.mp3'


class PlayAudio extends Component {
    constructor(props) {
        super(props)
    }

    async playAlert() {
        const sound = new Sound(audio, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load the system sound', error,'jkjkjkjk')
            }
        })

        sound.play((success) => {
            if (success) console.log('Cant able to play',success)
        })
    }

}

export default PlayAudio