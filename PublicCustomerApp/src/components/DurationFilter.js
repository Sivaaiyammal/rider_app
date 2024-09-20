import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { durationFilterStyle } from '../styles/DurationFilterStyle';
import CalenderIcon from '../assets/image/calender.svg'

import { utils } from '../utils/Utils';


const DurationFilter = ({ options, callback }) => {


    const [Options, setOptions] = useState(options || [
        {
            id: 'today',
            title: 'Today',
        },
        {
            id: 'yesterday',
            title: 'Yesterday',
        },
        {
            id: 'week',
            title: 'This Week',
        },
        {
            id: 'custom',
            type: 'custom',
            icon: CalenderIcon,
        }
    ]);

    const [ActiveOption, setActiveOption] = useState(Options[0]?.id);

    const HandleHeaderClick = (id) => {
        setActiveOption(id);

        if (id == 'custom') return

        let { start, end } = utils.getEasyDate(id);
        callback(id, start, end);
    }


    return (
        <View style={durationFilterStyle.container}>
            <View style={durationFilterStyle.containerItems}>
                {Options.map((item, index) => (

                    item.type && item.type == 'custom' ?
                        <TouchableOpacity
                            style={durationFilterStyle.containerItemIcon}
                            key={`duration-filter-${index}`}
                            onPress={() => HandleHeaderClick(item.id)}
                        >
                            <item.icon
                                width={20}
                                height={20}
                            />
                            <View
                                style={[
                                    durationFilterStyle.containerItemSpan,
                                    ActiveOption == item.id ? durationFilterStyle.containerItemAciveSpan : {}
                                ]}
                            ></View>
                        </TouchableOpacity>
                        :

                        <TouchableOpacity
                            style={durationFilterStyle.containerItem}
                            key={`duration-filter-${index}`}
                            onPress={() => HandleHeaderClick(item.id)}
                        >
                            <Text
                                style={[
                                    durationFilterStyle.containerItemLabel,
                                    ActiveOption == item.id ? durationFilterStyle.containerItemActiveLabel : {}
                                ]}
                            >{item.title}</Text>
                            <View
                                style={[
                                    durationFilterStyle.containerItemSpan,
                                    ActiveOption == item.id ? durationFilterStyle.containerItemAciveSpan : {}
                                ]}
                            ></View>
                        </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

export default DurationFilter;