import React, { Component } from 'react';
import { View, Button, Text, TouchableHighlight } from 'react-native';
import { styles, IconSize } from "../../../Styles/Settings/settings"
import { utils } from "../../../Controllers/utils";

// Images
import PaintRoller from "../../../Assets/Settings/PaintRoller.svg"
import A from "../../../Assets/Settings/A.svg"
import Wheel from "../../../Assets/Settings/Wheel.svg";
import HalfMoon from "../../../Assets/Settings/HalfMoon.svg";
import { DataStore } from '../../../Controllers/DataStore';

class ThemeSelector extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// selectedTheme: 'light', // Default theme
		};
	}

	componentDidMount = async () => {
		let theme = await DataStore.loadData('theme');
		console.log(theme)
		if (theme.status) {
			this.setState({
				selectedTheme: theme.data
			})
		} else {
			this.setState({
				selectedTheme: 'light'
			})
		}
	}

	componentDidUpdate = () => {
		// console.log(this.state);
	}


	selectTheme = async (theme) => {
		this.setState({ selectedTheme: theme });
		await DataStore.storeData('theme', theme)
	};

	render() {
		return (
			<View style={styles.card}>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
					<View style={styles.cardIcon}>
						<PaintRoller {...IconSize} />
					</View>
					<View style={{ ...styles.cardBody.container}}>
						<Text style={styles.cardBody.head}>
							App Theme
						</Text>
						<Text style={styles.cardBody.subject}>
							{utils.toTitleCase(this.state.selectedTheme || '')}
						</Text>
					</View>
					<View style={styles.cardNext}>
						<TouchableHighlight style={{ ...styles.themeButtons.buttons, backgroundColor: this.state.selectedTheme == 'auto' ? '#2785ff' : '#eeeeee' }} title="Auto" onPress={() => this.selectTheme('auto')} underlayColor={this.state.selectedTheme != 'auto' ? '#2785ff' : '#eeeeee'} >
							<A {...IconSize} />
						</TouchableHighlight>
						<TouchableHighlight style={{ ...styles.themeButtons.buttons, backgroundColor: this.state.selectedTheme == 'light' ? '#2785ff' : '#eeeeee' }} title="Light" onPress={() => this.selectTheme('light')} underlayColor={this.state.selectedTheme != 'light' ? '#2785ff' : '#eeeeee'}>
							<Wheel {...IconSize} />
						</TouchableHighlight>
						<TouchableHighlight style={{ ...styles.themeButtons.buttons, backgroundColor: this.state.selectedTheme == 'dark' ? '#2785ff' : '#eeeeee' }} title="Dark" onPress={() => this.selectTheme('dark')} underlayColor={this.state.selectedTheme != 'dark' ? '#2785ff' : '#eeeeee'}>
							<HalfMoon {...IconSize} />
						</TouchableHighlight>
					</View>
				</View>

			</View>
		);
	}
}

module.exports = ThemeSelector;