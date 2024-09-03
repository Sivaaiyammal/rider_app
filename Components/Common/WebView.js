import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../../Controllers/utils';

// const htmlFile = require('../../Legal/help.html')



class NewWebView extends Component {
	constructor(props) {
		super(props);

		this.webviewRef = React.createRef();
		console.log("webview")
	}

	goBack = () => {
		if (this.webviewRef.current) {
			this.webviewRef.current.goBack();
		}
	}

	render = () => {
		const { content, contentType, title, onBackPress } = this.props;

		return (
			<View style={{ flex: 1, alignItems: 'flex-start' }}>
			  <View style={{ padding: 10, flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1000 }}>
				<TouchableOpacity onPress={onBackPress || this.goBack} style={{ position: 'absolute', left: 0, padding: 10, paddingVertical: 20 }}>
				  <Icon name="chevron-left" size={24} color="black" />
				</TouchableOpacity>
				<Text style={{ textAlign: 'center', flex: 1 }}>{title}</Text>
			  </View>
			  <WebView source={content} style={{ width: WINDOW_WIDTH, height: (WINDOW_HEIGHT - 120) }} />
			</View>
		  );
		  
	}
}

export default NewWebView;
