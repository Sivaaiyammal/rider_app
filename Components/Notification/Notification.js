import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';

class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true,
        };
        this.timer = null;

        this.animatedValue = new Animated.Value(50);
    }

    componentDidMount() {

        Animated.timing (this.animatedValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start();

        if (this.props.timeOut) {
            this.timer = setTimeout(() => {
                this.setState({ isVisible: false });
                this.props.onHandleRemove();
            }, this.props.timeOut);
        }
    }
    
    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render() {
        const { position, variant, message, onHandleRemove } = this.props;

        if (!this.state.isVisible) return null;
    
        const positionStyle = (position === 'top') ? styles.top : styles.bottom;
    
        const variantStyle = styles[variant] || styles.default;
   
        return (
            <Animated.View style={[styles.container, positionStyle, { transform: [{ translateY: this.animatedValue }]}]}>
                <View style={[styles.notification, variantStyle]}>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity onPress={() => onHandleRemove()}>
                        <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom: 0,
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
    },
    top: {
        top: 10,
    },
    bottom: {
        bottom: 10,
    },
    notification: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    message: {
        flex: 1,
        color: '#000',
        fontWeight: 'bold',

    },
    dismissText: {
        marginLeft: 10,
        color: '#000',
    },
    default: {
        backgroundColor: '#f9f9f9',
    },
    success: {
        backgroundColor: '#d4edda',
    },
    error: {
        backgroundColor: '#f8d7da',
    },
    info: {
        backgroundColor: '#d1ecf1',
    },
    warning: {
        backgroundColor: '#fff3cd',
    },
});

Notification.propTypes = {
    variant: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timeOut: PropTypes.number.isRequired,
    position: PropTypes.string.isRequired,
    onHandleRemove: PropTypes.func.isRequired
};

Notification.defaultProps = {
    timeOut: 5000,
    position: "top",
    variant: 'default',
    onHandleRemove: () => {},
    
};

export default Notification;