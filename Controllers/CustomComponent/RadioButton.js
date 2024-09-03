import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';


class RadioButton extends Component {



    render() {

        const { selected, isLabelIcon, labelIcon, isLabelLeft, isDisableSelectedBG, isInnerCircleDisable, style, labelName, Colors } = this.props

        return (



            <View style={
                {
                    flexDirection: 'row',
                    margin: 10,
                    alignItems: 'center',
                    borderColor: '#eeeeee',
                    backgroundColor: isDisableSelectedBG ? "#fcfcfc" : !selected ? "#fcfcfc" : Colors,
                    borderRadius: 10,
                    justifyContent: isLabelLeft ? 'space-between' : 'flex-start'
                }}>

                {isLabelLeft ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {isLabelIcon ? <Image style={{ width: 20, height: 20 }} source={labelIcon} /> : ''}
                        <Text style={{ color: isDisableSelectedBG ? 'black' : !selected ? 'black' : 'white' }}>
                            {labelName}
                        </Text>
                    </View>
                    : ''}
                <View
                    style={[
                        {
                            height: 26,
                            width: 26,
                            borderRadius: 50,
                            borderWidth: selected ? 5 : .5,
                            borderColor: isDisableSelectedBG ? selected ? Colors : 'grey' : selected ? '#fff' : 'grey',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        style,
                    ]}>

                    {selected && !isInnerCircleDisable ? (
                        <View
                            style={{
                                height: 12,
                                width: 12,
                                borderRadius: 6,
                                backgroundColor: Colors
                            }}
                        />
                    ) : null}
                </View>
                {!isLabelLeft ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {isLabelIcon ? <Image style={{ width: 20, height: 20 }} source={labelIcon} /> : ''}
                        <Text style={{ color: isDisableSelectedBG ? 'black' : !selected ? 'black' : 'white' }}>
                            {labelName}
                        </Text>
                    </View>
                    : ''}


            </View>
        );
    }
}

export default RadioButton;
