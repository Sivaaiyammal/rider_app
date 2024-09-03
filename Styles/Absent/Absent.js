import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const AbsentScreenStyle = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		position: 'relative'
	},
	footer: {
		marginTop: 20,
		padding: 20
	},
	markedDate: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	confirmButton: {
		position: 'absolute',
		right: 10,
		bottom: 10,
		backgroundColor: '#000',  // or any color you want
		padding: 10,
		borderRadius: 5,
		alignItems: 'center',
	},

	confirmButtonText: {
		color: '#FFF',  // white color for the text
		fontSize: 16,
	},
});

const AbsentScreenPopup = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
	},
	modalView: {
		width: '80%',
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
		elevation: 5
	},
	imageStyle: {
		width: '100%',
		height: 200,
		marginBottom: 20
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center"
	},
	warningText: {
		color: 'red',
		marginBottom: 20,
		textAlign: "center"
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%'
	},
	cancelButton: {
		backgroundColor: '#ddd',
		padding: 10,
		borderRadius: 5,
		flex: 1,
		marginRight: 10,
	},
	confirmButton: {
		backgroundColor: '#237b53',
		padding: 10,
		borderRadius: 5,
		flex: 1,
		marginLeft: 10,
	},
	buttonText: {
		color: 'white',
		textAlign: 'center',
		fontWeight: 'bold'

	}
});

const lightThemeStyles = {
	dark: false,
	colors: {
		primary: '#2785ff',
		background: 'rgb(242, 242, 242)',
		card: 'rgb(255, 255, 255)',
		text: 'rgb(28, 28, 30)',
		border: 'rgb(199, 199, 204)',
		notification: 'rgb(255, 69, 58)',
	},
	AbsentScreenStyle: StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: 'white',
			position: 'relative'
		},
		footer: {
			marginTop: 20,
			padding: 20
		},
		markedDate: {
			fontSize: 18,
			fontWeight: 'bold',
		},
		confirmButton: {
			position: 'absolute',
			right: 10,
			bottom: 10,
			backgroundColor: '#000',  // or any color you want
			padding: 10,
			borderRadius: 5,
			alignItems: 'center',
		},

		confirmButtonText: {
			color: '#FFF',  // white color for the text
			fontSize: 16,
		},
	}),
	AbsentScreenPopup: StyleSheet.create({
		centeredView: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
		},
		modalView: {
			width: '80%',
			backgroundColor: "white",
			borderRadius: 10,
			padding: 20,
			alignItems: "center",
			elevation: 5
		},
		imageStyle: {
			width: '100%',
			height: 200,
			marginBottom: 20
		},
		modalText: {
			marginBottom: 15,
			textAlign: "center"
		},
		warningText: {
			color: 'red',
			marginBottom: 20,
			textAlign: "center"
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			width: '100%'
		},
		cancelButton: {
			backgroundColor: '#ddd',
			padding: 10,
			borderRadius: 5,
			flex: 1,
			marginRight: 10,
		},
		confirmButton: {
			backgroundColor: '#237b53',
			padding: 10,
			borderRadius: 5,
			flex: 1,
			marginLeft: 10,
		},
		buttonText: {
			color: 'white',
			textAlign: 'center',
			fontWeight: 'bold'

		}
	})
};

const darkThemeStyles = StyleSheet.create({
	dark: true,
	colors: {
		primary: '#2785ff',
		background: 'rgb(242, 242, 242)',
		card: 'rgb(255, 255, 255)',
		text: 'rgb(28, 28, 30)',
		border: 'rgb(199, 199, 204)',
		notification: 'rgb(255, 69, 58)',
	},
	AbsentScreenStyle: {
		container: {
			flex: 1,
			backgroundColor: 'white',
			position: 'relative'
		},
		footer: {
			marginTop: 20,
			padding: 20
		},
		markedDate: {
			fontSize: 18,
			fontWeight: 'bold',
		},
		confirmButton: {
			position: 'absolute',
			right: 10,
			bottom: 10,
			backgroundColor: '#000',  // or any color you want
			padding: 10,
			borderRadius: 5,
			alignItems: 'center',
		},

		confirmButtonText: {
			color: '#FFF',  // white color for the text
			fontSize: 16,
		},
	},
	AbsentScreenPopup: {
		centeredView: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
		},
		modalView: {
			width: '80%',
			backgroundColor: "white",
			borderRadius: 10,
			padding: 20,
			alignItems: "center",
			elevation: 5
		},
		imageStyle: {
			width: '100%',
			height: 200,
			marginBottom: 20
		},
		modalText: {
			marginBottom: 15,
			textAlign: "center"
		},
		warningText: {
			color: 'red',
			marginBottom: 20,
			textAlign: "center"
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			width: '100%'
		},
		cancelButton: {
			backgroundColor: '#ddd	',
			padding: 10,
			borderRadius: 5,
			flex: 1,
			marginRight: 10,
		},
		confirmButton: {
			backgroundColor: '#237b53',
			padding: 10,
			borderRadius: 5,
			flex: 1,
			marginLeft: 10,
		},
		buttonText: {
			color: 'white',
			textAlign: 'center',
			fontWeight: 'bold'

		}
	}
});



module.exports = { AbsentScreenStyle, AbsentScreenPopup, lightThemeStyles, darkThemeStyles }