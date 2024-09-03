import { Text, View, BackHandler, TouchableOpacity, TextInput } from 'react-native'
import React, { Component } from 'react'
import { container } from '../../Styles/DriverStyle/Emergency'
import TripHistoryHeader from '../Trips/TripHistoryHeader'
import { StyleSheet } from 'react-native'
import { Rating } from 'react-native-ratings'
import { TripSummaryStyle } from '../../Styles/Trips/Summary'
import NotificationManager from '../Notification/NotificationManager'
import FullScreenLoader from '../Loaders/FullScreenLoader'

class SendFeedback extends Component {
    constructor(props) {
        super(props)

        this.state = {
            rating: 3,
            type: "Compliment",
            message: '',
            typeOfFeedback: ["Suggestion", 'Compliment', "Not working"],
            loading:false
        }
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackward)
    }

    handleBackward = () => {
        this.props.onBack()
        return true
    }

    OnSubmit = async () => {
        const { message, rating, type } = this.state
        if (message == "") return NotificationManager.warning('Feedback cannot be empty', 3000, 'bottom')
        this.setState({loading:true})
        const response = await this.props.onSubmit(message, rating, type)
        if (response) {
            this.setState({ message: '',rating:3, type:"Compliment" })
            NotificationManager.success("Your feedback sent successfully", 3000, 'bottom')
        }
        else NotificationManager.error("Cannot send Feedback", 3000, "bottom")
        this.setState({loading:false})
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }
    render() {
        const { rating, type, loading } = this.state
        return (
            <View style={[container, { backgroundColor: '#fff', flex: 1 }]}>
                {
                    loading && <FullScreenLoader/>
                }
                <TripHistoryHeader onBackPress={this.props.onBack} headerText={"Send Feedback"} />
                <View style={feedbackStyle.contentContainer}>
                    <Text style={feedbackStyle.title}>We'd like your feedback to improve our App</Text>
                    <Text style={feedbackStyle.heading}>Give us ratings</Text>
                    <Rating
                        type="star"
                        ratingCount={5}
                        imageSize={35}
                        onFinishRating={(rating) => {
                            this.setState({ rating: rating })
                        }}
                        startingValue={rating}
                    />

                    <Text style={feedbackStyle.typeText}>Please select your feedback category below</Text>
                    <View style={feedbackStyle.typeContainer}>
                        {
                            this.state.typeOfFeedback.map((feedback) => {
                                return (
                                    <TouchableOpacity
                                        key={feedback}
                                        onPress={() => this.setState({ type: feedback })}
                                        style={[feedbackStyle.categoryBtn, { backgroundColor: feedback == type ? "#237b53" : "grey" }]}>
                                        <Text style={feedbackStyle.btnText}>{feedback}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>

                    <Text style={feedbackStyle.typeText}>Please leave your feedback below</Text>
                    <TextInput
                        style={TripSummaryStyle.textArea}
                        value={this.state.message}
                        underlineColorAndroid="transparent"
                        placeholder="Enter your feedback"
                        placeholderTextColor="grey"
                        numberOfLines={10}
                        multiline={true}
                        onChangeText={(value) => this.setState({ message: value })}
                    />
                    <TouchableOpacity style={TripSummaryStyle.submitButton} onPress={() => this.OnSubmit()}>
                        <Text style={TripSummaryStyle.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export default SendFeedback

const feedbackStyle = StyleSheet.create({
    contentContainer: {
        padding: 10,
        margin: 10
    },
    title: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    heading: {
        marginVertical: 20,
        fontSize: 16,
        color: '#212121',

    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10
    },
    categoryBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        maxWidth: 120,
        margin: 3,
        flexWrap: 'wrap',
        borderRadius: 8,
        backgroundColor: 'grey'
    },
    btnText: {
        textAlign: 'center',
        color: "#fff"
    },
    typeText: {
        marginTop: 30,
        fontSize: 16,
        color: '#000'
    }
})