import { BackHandler, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { Component } from 'react'
import { selectContactPhone } from 'react-native-select-contact';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

import TripHistoryHeader from '../Trips/TripHistoryHeader';

import MaleProfile from '../../Assets/SvgIcons/MaleProfile.svg'
import Nothing from '../../Assets/SvgIcons/whiteGroup.svg'
import Trash from '../../Assets/SvgIcons/Trash.svg'

import { container, Emergency } from '../../Styles/DriverStyle/Emergency'

import NotificationManager from '../Notification/NotificationManager'
import FullScreenLoader from '../Loaders/FullScreenLoader';
import SmallScreenLoader from '../Loaders/SmallScreenLoader';
import { FlatList } from 'react-native-gesture-handler';
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';

const MaleProfileIcon = React.memo((props) => (
    <MaleProfile {...props} />
  ));


class EmergencyContacts extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contacts: [],
            loading: false
        }
        this.onDelete = this.onDelete.bind(this)
        this.translation = getRedirection(TranslationFile)
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackward)
    }

    handleBackward = () => {
        this.props.onBack()
        return true
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    onDelete = async (contact) => {
        this.setState({ loading: true })
        await this.props.handleDeleteContact(contact.phone_number)
        this.setState({ loading: false })
    }

    getContact = ({ item }) => {
        let contact = item
        return (
            <View style={Emergency.contact}>
                <View style={Emergency.leftBox}>
                    <MaleProfileIcon height={50} width={50} />
                    {/* <Image source={MaleProfile} style={{ height: 50, width: 50 }} /> */}
                    <View style={Emergency.contactInfo}>
                        <Text style={Emergency.name}>{contact.name}</Text>
                        <Text style={Emergency.phone}>{contact.phone_number}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => this.onDelete(contact)}>
                    <Trash height={20} width={15} style={Emergency.icon} />
                </TouchableOpacity>
            </View>
        )
    }

    renderContacts = () => {
        console.log("RENDER CONTACTS")
        return (
            <FlatList
                data={this.props.contacts}
                renderItem={this.getContact}
                keyExtractor={item => item.name}
            />
        )
    }

    onAdd = async () => {
        this.setState({ loading: true })
        await this.props.handleAddContact()
        this.setState({ loading: false })
    }

    renderEmptyState() {
        return <View style={container}>
            <View style={Emergency.addContactContainer}>
                <View style={Emergency.noContactContainer}>
                    <Nothing height={70} width={70} />
                </View>
                <Text style={Emergency.addText}>{this.translation['Add your emergency contacts']}</Text>
                <Text style={Emergency.desText}>
                    {this.translation['Add Emergency contact des']}
                </Text>
                <TouchableOpacity style={Emergency.addContactBtn} onPress={this.onAdd}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>{this.translation['Add Contact']}</Text>
                </TouchableOpacity>
            </View>

        </View>
    }

    render() {
        return (
            <View style={container}>
                {
                    this.state.loading ? <SmallScreenLoader showBG={false} /> : null
                }
                <TripHistoryHeader onBackPress={this.props.onBack} headerText="Emergency Contacts" />
                {
                    this.props.contacts.length == 0 ?
                        this.renderEmptyState()


                        :

                        <View style={[container]}>
                            <View style={Emergency.contactContainer}>
                                {this.renderContacts()}
                            </View>
                            <TouchableOpacity style={Emergency.addMoreBtn} onPress={this.onAdd}>
                                <Text style={{ color: '#fff', fontSize: 16 }}>{['Add More']}</Text>
                            </TouchableOpacity>
                        </View>
                }
            </View>
        )
    }
}

export default EmergencyContacts

