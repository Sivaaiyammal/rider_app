import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {RadioButton} from 'react-native-paper';


class PaymentMethodDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentMethod: 'upi',
    };

    this.handlePayMentMethod = this.handlePayMentMethod.bind(this);
  }

  handlePayMentMethod(value) {
    this.setState({paymentMethod: value});
  }

  render() {

    const {onPaymentChange, itemData} = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View />
          <Text style={styles.headerText}>Choose your Payment GateWay</Text>
          <View />
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#eeeeee',
            width: '100%',
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#4b1abf',
              paddingBottom: 5,
              paddingHorizontal: 20,
            }}>
            {`Payment Method: ₹${itemData.get_driver_result.estimate_fare}`}
          </Text>
        </View>
        <View style={styles.body}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
              paddingVertical: 20,
            }}>
            Choose Payment Method
          </Text>
          <RadioButton.Group
            style={styles.bodyContent}
            onValueChange={this.handlePayMentMethod}
            value={this.state.paymentMethod}>

            <RadioButton.Item
              style={[
                styles.paymentMethod,
                this.state.paymentMethod == 'cash'
                  ? {
                      backgroundColor: '#4b1abf30',
                      borderWidth: 1,
                      borderColor: '#4b1abf',
                      color: '#fff',
                    }
                  : {},
              ]}
              label="Cash"
              value="cash"
            />
            <RadioButton.Item
              style={[
                styles.paymentMethod,
                this.state.paymentMethod == 'upi'
                  ? {
                      backgroundColor: '#4b1abf30',
                      borderWidth: 1,
                      borderColor: '#4b1abf',
                      color: '#fff',
                    }
                  : {},
              ]}
              label="UPI"
              value="upi"
            />
          </RadioButton.Group>
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => this.props.onPaymentChange(this.state.paymentMethod)}
              style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    // flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  arrowBtn: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 50,
    padding: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 7,
    paddingHorizontal: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
  },

  bodyContent: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },

  paymentMethod: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // width: '100%',
    padding: 10,
    backgroundColor: '#eeeeee',
    borderRadius: 15,
    marginBottom: 10,
  },

  paymentMethodText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },

  footer: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10, // or any other value you want for vertical positioning
    // alignItems: 'center',
  },

  buttonContainer: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PaymentMethodDetails;
