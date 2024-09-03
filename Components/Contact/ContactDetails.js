


import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SocialStyles, contactStyles } from '../../Styles/Contact/Social'


class ContactDetails extends Component {
    render() {
        return (
            <View style={contactStyles.contactSection}>
                <View style={contactStyles.detailContainer}>
                    <Icon name="phone" size={30} color="cornflowerblue" />
                    <View>
                        <Text style={contactStyles.contactTitle}>Call Support</Text>
                        <Text style={contactStyles.contactInfo}>{this.props.phone}</Text>
                    </View>
                </View>
                <View style={contactStyles.detailContainer}>
                    <Icon name="envelope" size={23} color="cornflowerblue" />
                    <View>
                        <Text style={contactStyles.contactTitle}>Send Email</Text>
                        <Text style={contactStyles.contactInfo}>{this.props.email}</Text>

                    </View>
                </View>
            </View>
        );
    }
}

export default ContactDetails;
