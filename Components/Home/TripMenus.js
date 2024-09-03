import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

// Custom Modules

import { bottomTabStyles } from '../../Styles/Home/Home'



class TripMenus extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {

        return (
            <View style={bottomTabStyles.tripMenuContainer}>

                {
                    this.props.menus.map((menu, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={menu.callback}>
                                <View >
                                    <View style={[bottomTabStyles.tripMenuImageContainer, { backgroundColor: menu.color || "#e4f2fc" }]}>
                                        {
                                            menu.imageType == 'svg' ? <>{menu.buttonImage}</>
                                                :
                                                <Image style={bottomTabStyles.tripMenuImage} source={menu.buttonImage} />

                                        }
                                    </View>
                                    <Text style={bottomTabStyles.menuText}>{menu.text}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }

            </View>
        );
    }

}

export default TripMenus;