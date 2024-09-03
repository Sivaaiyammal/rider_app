import React from "react";
import { View, Text, Image, Appearance } from "react-native";
import { styles } from '../../Styles/Account/account'
import { lightThemeStyles , darkThemeStyles } from '../../Styles/ColorSet'


// images
import starImage from '../../Assets/account/Star.webp';



class MyAccountStats extends React.Component {
    render() {
        return (
            <View style={styles.distanceContainer}>

                {
                    this.props.stats ? this.props.stats.map((item, index) => {
                        return (
                            <View key={index} style={styles.distanceItem}>
                                {item.imageType=='svg' ? <>{item.image}</> :<Image style={styles.distanceItemImage} source={item.image || starImage} />}
                                <Text style={styles.distanceItemText}>{item.value}</Text>
                            </View>
                        )
                    })
                        :
                        null
                }
            </View>
        );
    }
}

export default MyAccountStats;