import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, BackHandler } from 'react-native';
import TripHistoryHeader from '../Trips/TripHistoryHeader';
import moment from 'moment-timezone'

// Individual ticket item component
const TicketItem = ({ item }) => {
    let borderColor, color, ticketStatus, textColor;
    console.log(item, 'single item')

    switch (item.status) {
        case 0:
            color = 'darkorange';
            ticketStatus = "Raised";
            textColor = "darkorange";
            break;
        case 1:
            color = 'darkblue';
            ticketStatus = "Pending";
            textColor = "darkblue";
            break;
        case 2:
            color = 'darkgreen';
            ticketStatus = "Resolved";
            textColor = "darkgreen";
            break;
        case 3:
            color = 'darkred';
            ticketStatus = "Re opened";
            textColor = "darkred";
            break;
        case 4:
            color = 'lightblue'
            ticketStatus = "Wating";
            textColor = "lightblue";
    }



    updateDuration = (time) => {
        const momentObj = moment(time)
        const currentDate = moment();
        let dateComparison;
        if (momentObj.isSame(currentDate, 'day')) {
            dateComparison = 'Today';
        } else if (momentObj.isSame(currentDate.clone().subtract(1, 'day'), 'day')) {
            dateComparison = 'Yesterday';
        } else {
            dateComparison = momentObj.format('MMMM DD, YYYY');
        }
        const formattedTime = momentObj.format('h:mm a');
        // return [dateComparison, formattedTime]
        return dateComparison
    }


    return (
        <View style={[styles.ticketItem, { borderColor: "rgba(0,0,0,0.1)" }]}>
            <View style={{ backgroundColor: color, borderRadius: 8 }}>
                <Text style={[styles.titleText]}>{item.subject}</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={styles.ticketDetail}>
                    <Text style={styles.ticketDetailTitle}>Ticket ID</Text>
                    <Text style={[styles.detailText]}>{item.ticket_id}</Text>
                </View>
                <View style={styles.ticketDetail}>
                    <Text style={styles.ticketDetailTitle}>Created on</Text>
                    <Text style={[styles.detailText]}>{updateDuration(item.created_at)}</Text>
                </View>
                {/* <View style={styles.ticketDetail}>
                    <Text style={styles.ticketDetailTitle}>Ticket Category</Text>
                    <Text style={[styles.detailText]}>{item.category}</Text>
                </View> */}
                <View style={styles.ticketDetail}>
                    <Text style={styles.ticketDetailTitle}>Ticket Description</Text>
                    <Text style={[styles.detailText]}>{item.description}</Text>
                </View>
                <View style={styles.ticketDetail}>
                    <Text style={styles.ticketDetailTitle}>Ticket Status</Text>
                    <Text style={[styles.detailText, { color: textColor }]}>{ticketStatus}</Text>
                </View>
            </View>

        </View>
    );
};

// TicketCollection class component
class TicketCollection extends Component {
    constructor(props) {
        super(props);

    }

    renderTicket = ({ item }) => <TicketItem item={item} />;

    handleBackward = () => {
        this.props.changeScreen("RaiseTicket")
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
            <View style={styles.container}>
                {
                    this.props.tickets && this.props.tickets.length == 0 ? <View></View> : <FlatList
                        data={this.props.tickets}
                        renderItem={this.renderTicket}
                        keyExtractor={item => item.ticket_id}
                    />
                }

            </View>
        );
    }
}

// Styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    ticketDetail: {
        paddingLeft: 10,
        paddingBottom: 5
    },
    ticketDetailTitle: {
        fontWeight: "bold",
        fontSize: 15
    },
    ticketItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Soft background with reduced opacity
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        padding: 10,
        color: "white"
    },
    detailText: {
        fontSize: 14,
        paddingTop: 5
    }
});

export default TicketCollection;
