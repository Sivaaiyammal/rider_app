import { TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { ProgressBar } from '@react-native-community/progress-bar-android';

// icons
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

// styles
import { componentStyle } from '../Styles/ComponentStyles';

// voice recorder
import Voice from '@react-native-voice/voice';
import VoiceRecognition from './voiceRecognation';

const InputContainer = props => {
  const { placeholder, onChange, value, onCancelPress, onFocus, loading, autoFocus } = props;
  const [isRecording, setIsRecording] = useState(false);


  const startRecording = () => {
    setIsRecording(true);
    // Voice.start('en-US');
    // Voice.onSpeechStart = () => {
    //   console.log('Speech started');
    // }
    // Voice.onSpeechEnd = () => {
    //   console.log('Speech ended');
    //   setIsRecording(false);
    // }
  }

  return (
    <View style={componentStyle.inputContainer}>
      <View style={componentStyle.inputBox}>
        {/* searchIcon  */}
        <TouchableOpacity style={componentStyle.inputIcons}>
          <Fontisto name="search" size={14} />
        </TouchableOpacity>

        {/* Input */}
        <TextInput
          placeholder={placeholder}
          style={componentStyle.input}
          onChangeText={onChange}
          value={value}
          onFocus={onFocus}
          autoFocus={autoFocus || false}
        />
        {/* Mic Icon  */}
        <TouchableOpacity
          style={componentStyle.inputIcons}
          onPress={() => {
            startRecording();
          }}>
          <FontAwesome name="microphone" size={20} />
        </TouchableOpacity>
      </View>

      {loading && <ProgressBar
        styleAttr="Horizontal"
        indeterminate={true}
        color="blue"
        style={{
          height: 10,
          position: 'absolute',
          bottom: -2,
          left: 18,
          right: 72,
        }} />}

      {/* CancelBtn  */}
      {onCancelPress && (
        <TouchableOpacity
          style={componentStyle.searchCancelBtn}
          onPress={onCancelPress}>
          <AntDesign name="close" size={22} />
        </TouchableOpacity>
      )}
      <VoiceRecognition modalVisible={isRecording} setModalVisible={setIsRecording} />
    </View>
  );
};

export default InputContainer;
