import React, { Component } from 'react';
import {Image,} from 'react-native';


// styles

import { contactStyles } from '../../Styles/Contact/Social'

// images

import BannerImage from '../../Assets/ContactUs/Banner.webp';

class ContactUsBanner extends Component {
  render() {

    return (
      
        <Image
          source={this.props.BannerImage || BannerImage}
          style={contactStyles.illustration}></Image>
    
    );
  }
}

export default ContactUsBanner;
