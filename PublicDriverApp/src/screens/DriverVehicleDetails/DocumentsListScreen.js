import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import NavBarA from '../../components/TopNavBar/NavBarA';
import {useNavigation} from '@react-navigation/native';
import {colors, Fonts} from '../../constants/constants';
import DocWarning from '../../assets/image/svgIcons/docWarning.svg';
import {documentsList} from '../../constants/JsonData';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DocumentsListScreen = () => {
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };

  const onDocTypePress = item => {
    navigation.navigate('DocUploadScreen', {doc: item});
  };

  return (
    <View style={styles.container}>
      <NavBarA
        onBackPress={onBackPress}
        title={'Upload'}
        subtitle={'Document Details'}
      />
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.infoText}>Format : JPG / PNG / PDF</Text>
          <Text style={styles.infoText}>Size : Maximum 1MB each</Text>
          <Text style={styles.infoText}>Resolution : Maximum 2000px</Text>
        </View>
        <DocWarning />
      </View>
      <ScrollView contentContainerStyle={styles.Listcontainer}>
        {documentsList.map(item => {
          return (
            <TouchableOpacity
              onPress={() => onDocTypePress(item)}
              key={item.id}
              style={styles.docBtn}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  paddingLeft: 10,
                }}>
                <Text style={styles.pointer}>{item.id}</Text>
                <Text style={styles.docName}>{item.name}</Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                color={colors.black}
                size={16}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default DocumentsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  infoContainer: {
    backgroundColor: colors.yellow_light,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  Listcontainer: {
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  docBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: colors.white_dirt,
    marginVertical: 10,
    alignItems: 'center',
    paddingRight: 10,
  },
  pointer: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.yellow,
    borderRadius: 100,
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  docName: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: colors.black,
  },
});
