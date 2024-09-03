import React, { Component } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TripHistoryHeader from '../Trips/TripHistoryHeader';
import RaiseTicketImage from '../../Assets/Tickets/RaiseTicket'
import { ScrollView } from 'react-native-gesture-handler';
import { DriverHomeContext } from '../../DriverComponent/Home/HomeScreen';
import NotificationManager from '../Notification/NotificationManager';
import FullScreenLoader from '../Loaders/FullScreenLoader';

class RaiseTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // title: '',
            reason: '',
            feedback: '',
            loading:false
        };
    }

    // Update state when title input changes
    handleTitleChange = (text) => {
        this.setState({ title: text });
    };

    // Update state when reason is selected
    handleReasonChange = (itemValue) => {
        this.setState({ reason: itemValue });
    };

    // Update state when feedback input changes
    handleFeedbackChange = (text) => {
        this.setState({ feedback: text });
    };

    // Handle form submission (to be implemented)
    handleSubmit = async() => {
        const {reason,feedback} = this.state
        if(reason == "")return NotificationManager.warning("Select Reason to proceed",3000,"bottom")
        if(feedback == "") return NotificationManager.warning("Please enter description",3000,"bottom")
        this.setState({loading:true})
        const response = await this.props.handleRaiseTicket(this.state)
        if(response){
            this.setState({
                reason:"",
                feedback:"",
            })
            NotificationManager.success("Ticket Raised Successfully",3000,"bottom")
        }else{
            NotificationManager.error("Cannot Raise Ticket",3000,"bottom")
        }
        this.setState({loading:false})
    };

    handleBackward = () => {
        this.props.onBackPress()
        return true
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackward)
    }

    render() {
        return (
            <ScrollView >
            { this.state.loading  && <FullScreenLoader/>}
                <View style={{ paddingTop: 20, position: 'relative' }} >
                    <RaiseTicketImage height={250} width="100%" />
                    <View style={styles.viewTickerBtnContainer}>
                        <TouchableOpacity style={styles.viewTicketButton} onPress={() => this.props.changeScreen("TicketCollection")}>
                            <Text style={styles.viewTicketText}>View Tickets</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.container}>
                    <Text style={{
                        textAlign: "center",
                        fontSize: 17,
                        fontWeight: 'bold',
                        padding: 20,
                    }}>
                        Raise New Ticket
                    </Text>
                    {/* <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title"
                        onChangeText={this.handleTitleChange}
                        value={this.state.title}
                    /> */}

                    <Text style={styles.label}>Reason</Text>
                    <Picker
                        selectedValue={this.state.reason}
                        onValueChange={this.handleReasonChange}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a Reason" value="" />
                        {
                            this.props.select_reasons.map((reason,index)=>{
                                return <Picker.Item label={reason} value={reason} key={index} />
                            })
                        }
                        
                    </Picker>

                    <Text style={styles.label}>Additional Feedback</Text>
                    <TextInput
                        style={styles.largeInput}
                        placeholder="Provide additional feedback"
                        onChangeText={this.handleFeedbackChange}
                        value={this.state.feedback}
                        multiline
                    />


                    <TouchableOpacity style={styles.button} onPress={()=>this.handleSubmit()}>
                        <Text style={styles.text}>Raise Ticket</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        borderWidth: 2,
        borderColor: 'tomato', // Example blue color for the border
        backgroundColor: 'transparent',
        width: "100%",
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:8,
    },
    viewTicketButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "cornflowerblue",
        width: "50%"
    },

    viewTickerBtnContainer: {
        width: "100%",
        position: 'absolute',
        top: 150,
        alignItems: 'center'
    },

    viewTicketText: {
        fontWeight: "bold"
    },
    text: {
        color: 'tomato', // Text color matching the border
        fontSize: 16,
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white' // Light grey background
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: 12,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#333333' // Dark text for better readability
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)', // Low opacity border
        padding: 10,
        width: '100%',
        backgroundColor: '#FFFFFF', // White background for input
        borderRadius:8
    },
    largeInput: {
        height: 100,
        margin: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)', // Low opacity border
        padding: 10,
        marginBottom: 20,
        width: '100%',
        backgroundColor: '#FFFFFF', // White background for input
        textAlignVertical: 'top', // Align text to top for multiline input
        borderRadius:8
    },
    picker: {
        width: '100%',
        margin: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)', // Low opacity border
        backgroundColor: '#FFFFFF' // White background for picker
    }
});

export default RaiseTicket;
