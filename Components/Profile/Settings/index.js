import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { styles, IconSize } from "../../../Styles/Settings/settings";
import { DataStore } from "../../../Controllers/DataStore";

// components
import ThemeSelector from "./ThemeSelector";
import NewWebView from "../../Common/WebView";
import LanguageScreen from '../../Language/ChooseLanguageScreen';


// images
import Home from "../../../Assets/Settings/Home.svg";
import Help from "../../../Assets/Settings/Help.svg";
import Info from "../../../Assets/Settings/Info.svg";
import Language from "../../../Assets/Settings/Language.svg";
import MoreApps from "../../../Assets/Settings/MoreApps.svg";
import Policy from "../../../Assets/Settings/Policy.svg";
import Privacy from "../../../Assets/Settings/Privacy.svg";
import Support from "../../../Assets/Settings/Support.svg";
import Bug from "../../../Assets/Settings/Bug.svg";
import Docs from "../../../Assets/Settings/Docs.svg";
import Feedback from "../../../Assets/Settings/Feedback.svg";


const SettingOption = ({ icon, title, subTitle, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <View style={styles.cardIcon}>
                {/* <Icon name={icon} size={25} color="black" /> */}
                {icon}
            </View>
            {/* <Icon name={icon} size={24} color="black" /> */}
            <View style={styles.cardBody.container}>
                <Text style={styles.cardBody.head}>{title}</Text>
                {subTitle ? <Text style={styles.cardBody.subject}>{subTitle}</Text> : null}
            </View>
            <View style={styles.cardNext}>
                <Icon name="chevron-right" size={18} color="black" />
            </View>
        </View>
    </TouchableOpacity>
);

const CustomWebView = ({ title, url, onBackPress }) => (
    <SafeAreaView style={{ flex: 1 }}>
        <NewWebView
            url={url ? url : "https://example.com"}
            title={title ? title : "WebView"}
            onBackPress={() => {
                // Custom back button behavior
                // You can add your own logic here
                onBackPress();
            }}
        />
    </SafeAreaView>
);


class SettingsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otherComponentVisible: false,
            webViewVisible: false,
            webViewProps: {},
            otherComponent: ''
        };
    }

    componentDidMount = () => {
        console.log("mounted settings")
    }

    componentDidUpdate = () => {
        console.log("settings updated")
    }

    componentWillUnmount = () => {
        console.log("unmounted settings")
    }

    onBackPress = () => {
        console.log("Back pressed to settings");
        this.setState({
            webViewVisible: false,
            webViewProps: {},
            otherComponentVisible: false,
            otherComponent: ''
        });
    }

    renderWebView = () => {
        if (this.state.webViewVisible) {
            return (
                <CustomWebView
                    title={this.state.webViewProps.title}
                    url={this.state.webViewProps.url}
                    onBackPress={this.onBackPress}
                />
            );
        }
        return null;
    }

    handleRadioButtonPress = (language) => {
        console.log('language', language);
        this.setState({ selectedLanguage: language });
        DataStore.storeData("language", language);
    }

    renderOtherComponent = () => {
        console.log("Other components", this.state)
        // if (this.state.otherComponent) {
        switch (this.state.otherComponent) {
            case 'Language':
                return (
                    <LanguageScreen
                        selectedLanguage={this.state.selectedLanguage || 'English'}
                        changeScreen={this.onBackPress}
                        Colors={'#6f00ff'}
                        listOFLanguages={[
                            {
                                Text: 'English',
                                value: 'English',
                                callback: this.handleRadioButtonPress,
                            },
                            {
                                Text: 'தமிழ்',
                                value: 'தமிழ்',
                                callback: this.handleRadioButtonPress,
                            },
                            {
                                Text: 'हिन्दी',
                                value: 'हिन्दी',
                                callback: this.handleRadioButtonPress,
                            },
                        ]}
                        settings={true}
                    />
                );
                break;
            case '':
                return (
                    <>
                        <Text>Other Component</Text>
                    </>
                );
                break;
            default:
                return (
                    <>
                        <Text>Other Component</Text>
                    </>
                );
                break;

        }
        // }
        // return null;

    }



    render = () => {
        return (
            <>
                {this.state.otherComponentVisible == true ? (
                    this.renderOtherComponent()

                ) : (
                    <ScrollView style={styles.container}>
                        {
                            this.state.webViewVisible == false ? (
                                <>
                                    <View style={styles.header}>
                                        <Text style={styles.headerText}>Settings</Text>
                                    </View>
                                    <View style={styles.children}>
                                        <View style={styles.subChild}>
                                            <SettingOption icon={<Home {...IconSize} />} title="Home Location" subTitle="#1, Sample Street, Sample Area, Locality, City....." onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Language",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                        </View>
                                        <View style={styles.subChild}>
                                            <SettingOption icon={<Language {...IconSize} />} title="Languages" onPress={() => {
                                                this.setState({
                                                    otherComponentVisible: true,
                                                    otherComponent: 'Language'
                                                });
                                            }} />
                                        </View>
                                        <View style={styles.subChild}>
                                            <ThemeSelector />
                                        </View>
                                        <View style={styles.subChild}>
                                            <SettingOption icon={<Privacy {...IconSize} />} title="Data Privacy" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Data Privacy",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Help {...IconSize} />} title="Help" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Help",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Docs {...IconSize} />} title="Terms and Conditions" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Terms and Conditions",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Policy {...IconSize} />} title="Privacy Policy" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Privacy Policy",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                        </View>
                                        <View style={styles.subChild}>
                                            <SettingOption icon={<Info {...IconSize} />} title="About Us" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "About Us",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Feedback {...IconSize} />} title="Send Feedback" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Send Feedback",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Bug {...IconSize} />} title="Report Error" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Report Error",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                            <SettingOption icon={<Support {...IconSize} />} title="Support" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "Support",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                        </View>
                                        <View style={styles.subChild}>
                                            <SettingOption icon={<MoreApps {...IconSize} />} title="More Apps" onPress={() => {
                                                this.setState({
                                                    webViewVisible: true,
                                                    webViewProps: {
                                                        title: "More Apps",
                                                        url: "https://example.com",
                                                    },
                                                });
                                            }} />
                                        </View>
                                    </View>
                                </>
                            ) : (
                                this.renderWebView()
                            )}
                    </ScrollView>
                )}
            </>

        );
    }
}

export default SettingsScreen;