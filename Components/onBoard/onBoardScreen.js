// Splash Screen component for the app

import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import { onbaordScreenStyle } from '../../Styles/onboard/onboardScreen'
import PropTypes from 'prop-types'
import { DataStore } from '../../Controllers/DataStore'

class OnboardScreen extends Component {

    constructor(props) {
        super(props)

        this.state = {
            navigation: ""
        }

        this.navigation = this.props.navigation;

    }

    handleNext = () => {
        DataStore.storeData('onboard', true);
        this.props.handleDone()
    }

    renderDot = ({ selected }) => {
        // console.log(selected, 'selected')
        return (
            <View
                style={{
                    width: selected ? 24 : 8, // Set the width of the dot
                    height: 8, // Set the height of the dot
                    marginHorizontal: 3, // Set the margin between dots
                    borderRadius: 4, // Make the dot circular (half of the width)
                    backgroundColor: selected ? this.props.themeColor : '#eeeeee', // Change the color based on selection
                }}
            />
        );
    };

    render() {

        const { pages , dashed = true , finishButtonText = 'Get Started'} = this.props

        return (
            <View style={onbaordScreenStyle.container}>
                <Onboarding

                    onSkip={() => this.handleNext()}
                    onDone={() => this.handleNext()}
                    DotComponent={this.renderDot}
                    DoneButtonComponent={({ isLight, ...props }) => {
                        return <TouchableOpacity {...props} style={{ padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', minWidth: 80, alignItems: 'center', backgroundColor: 'black', padding: 6, color: 'white', borderRadius: 5 }}>
                                <Text style={{ color: 'white' }}>{finishButtonText}</Text>
                            </View>
                        </TouchableOpacity>
                    }}
                    NextButtonComponent={({ isLight, ...props }) => {
                        return <TouchableOpacity {...props} style={{ padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', width: 80, alignItems: 'center', backgroundColor: 'black', padding: 6, color: 'white', borderRadius: 5 }}>
                                <Text style={{ color: 'white' }}>Next</Text>
                            </View>
                        </TouchableOpacity>
                    }}
                    bottomBarHighlight={false}
                    pages={
                        pages.map((item, index) => {
                            return {
                                backgroundColor: item.backgroundColor,
                                image: (
                                    <View>
                                        {item.imageType == 'svg' ? <>{item.image}</> : <Image style={onbaordScreenStyle.lottie} source={item.image} />}
                                    </View>
                                ),
                                title: (

                                    <View style={{ alignItems: 'center', padding: 10 }}>
                                        {item.title.map((title, index) => {
                                            return <Text key={index} style={onbaordScreenStyle.title}>{title}</Text>
                                        })}
                                        { dashed && <View style={[onbaordScreenStyle.titleContainer,{backgroundColor: this.props.themeColor}]} /> }
                                    </View>
                                ),
                                subtitle: item.description ? (
                                    <View style={{ padding: 15 }}>
                                        <Text style={{ fontFamily: 'SofiaPro-Light', fontSize: 16, textAlign: 'center', color: '#212121' }}>
                                            {item?.subtitle}
                                        </Text>
                                        <View style={{ padding: 15, marginTop: 20, backgroundColor: '#fffdf2', borderColor: (this.props.themeColor || '#ffd100'), borderRadius: 5, borderWidth: 1, borderStyle: 'dashed' }}>
                                            <Text style={{ fontFamily: 'SofiaPro-Light', fontSize: 16, textAlign: 'center', color: '#212121' }}>
                                                {item?.description}
                                            </Text>
                                        </View>
                                    </View>
                                ) : item?.subtitle || ''
                            }
                        })}
                />
            </View>
        )
    }
}

OnboardScreen.prototype = {
    pages: PropTypes.array.isRequired,
    handleDone: PropTypes.func.isRequired
}

OnboardScreen.defaultProps = {
    pages: [],
    handleDone: () => { }
}

export default OnboardScreen;