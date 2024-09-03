import React from 'react';
import { View, Text, Image, Appearance, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../../Styles/Account/account';
import { lightThemeStyles, darkThemeStyles } from '../../Styles/ColorSet';

import personImage from '../../Assets/account/person.webp';
import EditPencil from '../../Assets/SvgIcons/EditPencil.svg'
import EditOk from '../../Assets/SvgIcons/EditOk.svg'
import CancelEdit from '../../Assets/SvgIcons/CancelEdit.svg'
import { StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';


// Your components and imports here

class MyAccountInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempName: ""
    }
  }

  onCancel = (key) => {
    // while cancelling the edit process empty the temporary name to avoid values interpretion
    this.setState({ tempName: "" })
    this.props.onCancel(key)

  }

  onConfirm = (key, val) => {

    this.props.onConfirm(key, val)

    this.setState({ tempName: "" })
  }

  onEdit = (key, val) => {

    this.setState({ tempName: val })
    this.props.onEdit(key)

  }

  handleShiftChange = (val)=>{
    this.setState({tempName:val})
    this.props.handleShiftChange("Shift Timings",val)
  }


  render() {
    // let ColorSet = Appearance.getColorScheme() === 'light' ? lightThemeStyles : darkThemeStyles;

    return (

      <>
        {this.props.infos ? (
          this.props.infos.map((item, index) => {
            return (
              <View key={index} style={styles.profileContainer}>

                <View style={styles.profileItemImageContainer}>
                  {item.imageType == 'svg' ? (
                    <>{item.image}</>
                  ) : (
                    <Image
                      source={item.image || personImage}
                    />
                  )}
                </View>


                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {
                    !item.editOption && item.editable ?

                      <View style={inputStyle.editContainer}>

                        <View>

                          <Text style={styles.profileItemHead}>{item.key}</Text>
                          <View style={inputStyle.inputContainer}>
                            {
                              item.key == "Shift Timings" ? 

                            <Picker
                              selectedValue={this.state.tempName}
                              onValueChange={this.handleShiftChange}
                              style={{width:'75%'}}
                            >
                              <Picker.Item label="Select a Shift Time" value="" />
                              {
                                this.props.shifts.map((shift, index) => {
                                  return <Picker.Item label={shift.shift_time} value={shift.id} key={index} />
                                })
                              }

                            </Picker> :
                            <TextInput
                              value={this.state.tempName}
                              onChangeText={(val) => { this.setState({ tempName: val }) }}
                              keyboardType='default'
                              style={inputStyle.input}
                            />
                          }


                            <View style={inputStyle.controlContainer}>

                              <TouchableOpacity onPress={() => this.onConfirm(item.key, this.state.tempName)}>
                                <EditOk />
                              </TouchableOpacity>

                              <TouchableOpacity onPress={() => this.onCancel(item.key)}>
                                <CancelEdit />
                              </TouchableOpacity>

                            </View>

                          </View>

                        </View>

                      </View>

                      :

                      <View>
                        <Text style={styles.profileItemHead}>{item.key}</Text>
                        <Text style={styles.profileItemText}>{item.value}</Text>
                      </View>
                  }


                </View>
                {item.editOption && <TouchableOpacity style={{ position: 'absolute', right: 15, top: "50%" }} onPress={() => this.onEdit(item.key, item.value)}><EditPencil /></TouchableOpacity>}
              </View>
            );
          })
        ) : (
          <View></View>
        )}
      </>
    );
  }
}

export default MyAccountInfo;


const inputStyle = StyleSheet.create({
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "grey",
    width: 220,
    padding: 5,
    color: "#212121"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  controlContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: 'center'
  },


})