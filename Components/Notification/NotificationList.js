import {
  View,
  Text,
  SectionList,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {Component} from 'react';
import {utils} from '../../Controllers/utils';

export class NotificationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemData: this.props.itemData,
    };
  }

  renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.notification_card}
      onPress={() => console.log()}>
      <View
        style={[
          styles.notification_card_Img,
          {backgroundColor: !item.read ? '#ebf0ff' : '#eeeeee'},
        ]}>
        <Image
          source={item.image}
          style={{width: '50%'}}
          resizeMode="contain"
        />
      </View>
      <View style={styles.notification_card_title}>
        <Text
          style={{fontSize: 14, color: !item.read ? '#212121' : ' #616161'}}>
          {item.title}
        </Text>
        <Text
          style={{fontSize: 14, color: !item.read ? '#212121' : ' #616161',marginTop:6}}>
          {' '}
          {utils.formatDateAndTime(item.createdDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  renderSectionHeader = ({section: {title}}) => (
    <View>
      <Text style={{fontSize: 16}}>{title}</Text>
    </View>
  );

  render() {
    const {itemData} = this.state;
    const sections = Object.entries(itemData).map(([title, data]) => ({
      title,
      data,
    }));

    return (
      <View style={styles.container}>
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

export default NotificationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notification_card: {
    width: '100%',
    height: 80,
    padding: 6,
    margin: 4,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  notification_card_Img: {
    width: '18%',
    backgroundColor: 'red',
    borderRadius: 50,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginRight: 4,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  notification_card_title: {
    width: '80%',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
