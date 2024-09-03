import React from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function InputWithRightIcon(props) {
    let { label, bgColor, onChange, value, keyboardType, iconName, imgType, onInputChange, animated, editable } = props

    const [isFocused, setIsFocused] = React.useState(false);
    const labelStyle = {
        position: 'absolute',
        left: 10,
        top: !isFocused  ? 20 : 0,
        fontSize: !isFocused  ? 18 : 14,
        color: !isFocused ? '#aaa' : '#000',
    };

    const handleFocus = () => setIsFocused(true)

    const handleBlur = () => setIsFocused(false)

    function handleOnChange(value, label) {
        onChange ? onChange(value,label) : onInputChange(label, value)
    }

    return (
        <View style={[styles.container, { bacgroundColor: bgColor, borderColor: isFocused ? '#ffd100' : 'rgba(0,0,0,0.3)', marginHorizontal: 10 }]}>
            {
                animated ? <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text> : null
            }
            <TextInput
                editable={editable ?? true}
                keyboardType={keyboardType}
                onChangeText={(value) => handleOnChange(value, label)}
                style={[styles.input, { borderColor: isFocused ? '#ffd100' : 'rgba(0,0,0,0.3)' }]}
                placeholder={label}
                value={value}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            <View style={styles.icon}>
                {
                    imgType == 'svg' ? iconName : <Icon name={iconName || 'check'} size={18} color={isFocused ? '#ffd100' : 'black'} />
                }

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Aligns TextInput and Icon horizontally
        alignItems: 'center', // Centers them vertically
        borderWidth: 1, // Border for the whole container
        borderColor: 'rgba(0,0,0,0.3)', // Border color
        borderRadius: 5, // Rounded corners
        marginVertical: 10
    },
    input: {
        flex: 1, // TextInput takes up maximum space
        paddingLeft: 10, // Padding inside the TextInput
    },
    icon: {
        paddingRight: 15, // Padding to the right of the icon
    },
});
