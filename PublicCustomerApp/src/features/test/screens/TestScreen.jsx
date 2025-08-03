import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PhonePePaymentSDK from 'react-native-phonepe-pg'
import base64 from 'react-native-base64'
import { sha256 } from 'react-native-sha256';

const TestScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  const [merchantId, setMerchantId] = useState('M2202LBE4KQJX');
  const [environment, setEnvironment] = useState('PRODUCTION');
  const [enableLogging, setEnableLogging] = useState(true);
  const [appId, setAppId] = useState('M2ZmOThkZDQtZDllZS00ZTIyLWI4NTctOTBkZDkxMmVkNDkx');

  const generateMerchantTransactionId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const handlePayNow = async () => {
  

    try {
      // Initialize PhonePe SDK
      await PhonePePaymentSDK.init(environment, merchantId, appId, enableLogging);
      
      
      
      const requestBody = {
        "orderId": "OMO2507312139459375218769",
        "merchantId": "M2202LBE4KQJX",
        "token": "hq4wOGdzX31IuPyyh7/7AYOLiipO42P8QtgmusudZHta7zUAMbV5uMV5f6kF1hmvheryrLtNiVF3UWxwU+f7TRhF3j/8AOP07TQNlFIgtz0VD4aoZqVjajlz4u0Srq54UsZ1l6RrvpW99G5xU02LiF0ujaGLOJ4briRgvcKI4VUFJpEisUE/E+Wx6ukPPQV6ikWgcQ/YJNNgn0g4MWGPaGtAnHJA23VKvvHUZLuC1fOASUGajecZ63gvDn7HH+TIHUN7b+g230Z2gtrV9gbrBVTdBUEi5J6p4f1nMjiZHklhdvKTMpsNO7a/svNHZnS400GkG1irRu65rEzluFlgIBCFYxJQn4lfdI+m449tmieOF4l1xp8Jt2fCm1OOb/HiG6EZfvLaCdQgfat8k8mbZ3k7fLoR/jBYnawxsnbwLM62TIn81jB8wALV2PLOnt8FWVsEEenT5PyWRcuM8P6i15xqb6zaV9/NpqLAqfZ13r3LhNV6FxkeIAAtnhSOu9qfLw2FZN2zEA==",
        "paymentMode": {
            "type": "PAY_PAGE"
        }
    }

      // Base64 encoding using base64 library
      const body = JSON.stringify(requestBody);
     

      const paymentResult = await PhonePePaymentSDK.startTransaction(
        body,
        "com.VaidicAstro"
      );
      
      console.log("Payment result:", paymentResult);
      
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert('Error', 'Payment initialization failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        maxLength={15}
      />
      <Text style={styles.label}>Enter Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handlePayNow}>
        <Text style={styles.buttonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TestScreen;
