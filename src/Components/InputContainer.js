import { TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { ProgressBar } from '@react-native-community/progress-bar-android';

// icons
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

// styles
import { componentStyle } from '../Styles/ComponentStyles';

const InputContainer = props => {
  const { placeholder, onChange, value, onCancelPress, onFocus, loading, autoFocus } = props;

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
          onPress={() => console.log('micPressed')}>
          <FontAwesome name="microphone" size={20} />
        </TouchableOpacity>
      </View>

      {loading && <ProgressBar
        styleAttr="Horizontal"
        indeterminate={true}
        color="blue"
        style={{
          // width: '100%',
          height: 10,
          position: 'absolute',
          // top: 0,
          bottom: -2,
          left: 18,
          right: 72,
        }} />}

      {/* CancelBtn  */}
      <TouchableOpacity
        style={componentStyle.searchCancelBtn}
        onPress={onCancelPress}>
        <AntDesign name="close" size={22} />
      </TouchableOpacity>
    </View>
  );
};

export default InputContainer;
