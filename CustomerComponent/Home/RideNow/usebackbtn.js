import React, {Component} from 'react';
import {BackHandler} from 'react-native';

class CustomBackHandler extends Component {
  constructor(props) {
    super(props);

    this.handleBackPress = this.handleBackPress.bind(this);
  }

  handleBackPress() {
    const {onBackPress} = this.props;
    if (onBackPress) {
      onBackPress();
    }
    return true;
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    return null;
  }
}

export default CustomBackHandler;
