import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import NotificationManager from '../../Components/Notification/NotificationManager';

//styles
import {AgreementStyles} from '../../Styles/DriverStyle/AgreementStyle'

// images
import GobackSvg from '../../Assets/SvgIcons/GobackSvg.svg'
import WhiteArrow from '../../Assets/DriverAppIcons/WhiteArrow.webp'
import { DataStore } from '../../Controllers/DataStore';
import { getRedirection } from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';



class AgreementScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            agree: this.props.agree,
            isChecked: this.props.isChecked,
        };

        this.translation = getRedirection(TranslationFile)
    }
    toggleCheckbox = ()=>{
        this.setState({isChecked:!this.state.isChecked})
    }

    handleGetStarted = async () => {
        // console.log('Get Started pressed');
        if(!this.state.isChecked){
            // alert('Please agree to the above Agreement, Rules & Regulations, Terms & Conditions and Privacy Policy')
            NotificationManager.error('Please agree to the above Agreement, Rules & Regulations, Terms & Conditions and Privacy Policy', 3000, 'bottom')
            return
        } else {
            await DataStore.storeData('agreement', true);
            this.props.navigation.reset({
                index: 0,
                routes: [{ name: this.props.nextScreen || 'AuthenticationScreen' }],
            });
        }
    };

    componentDidMount() {
        // console.log('Agreement Screen Mounted');
        DataStore.loadData('agreement').then((res) => {
            if (res.data) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: this.props.nextScreen || 'AuthenticationScreen' }],
                });
            }
        });
    }

    handleBackward = ()=>{
        this.props.navigation.reset({
            index: 0,
            routes: [{ name: 'OnboardScreen' }],
        });
    }

    render() {
        return (
            <View style={AgreementStyles.container}>
                <View style={AgreementStyles.header}>
                    {/* <TouchableOpacity style={{ position: 'absolute', left: 8 }} onPress={()=>this.handleBackward()}>
                        <GobackSvg height={15} width={15} />
                    </TouchableOpacity> */}
                    <Text style={AgreementStyles.title}>{this.translation['Agreement']}</Text>
                </View>
                <ScrollView style={AgreementStyles.content}>
                    <Text style={AgreementStyles.introContent}>
                        {this.translation[this.props.head]}
                    </Text>
                    <Text style={AgreementStyles.description}>
                        {this.translation[this.props.description]}
                    </Text>
                    <View>
                        <Text style={AgreementStyles.instructionsTitle}>{this.translation['Instructions:']}</Text>
                        {
                            this.props.instructions.map((list, index) => {
                                return <Text style={AgreementStyles.rules} key={index}>{index + 1}. {this.translation[list.text]}</Text>
                            })
                        }
                    </View>

                    <View style={AgreementStyles.footer}>
                        <View style={AgreementStyles.checkboxContainer}>
                            <CheckBox
                                    value={this.state.isChecked}
                                    onValueChange={()=>this.toggleCheckbox()}
                                    // style={{padding:0, margin: 0, outline:'none', bor}}
                                    tintColors={{ false: '#000' }}
                                />
                            <TouchableOpacity onPress={()=>this.toggleCheckbox()} style={AgreementStyles.checkboxTextContainer}>
                                <Text style={AgreementStyles.label}>{this.translation['Agreement Agree Info']}</Text>
                            </TouchableOpacity>
    
                        </View>
                        <TouchableOpacity onPress={()=>this.handleGetStarted()} style={AgreementStyles.getStartedBtn}>
                            <Text style={{color:'#fff'}}>{this.translation['Get Started']}</Text>
                            <Image source={WhiteArrow}/>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

            </View>
        );
    }
}



export default AgreementScreen;
