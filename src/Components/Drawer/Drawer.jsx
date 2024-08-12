import { Animated, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { IconButton } from "react-native-paper";
import { drawerStyles } from "../../Styles/DrawerStyles";
import { TouchableOpacity } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "../../Constants/Contants";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useStackScreenStore } from "../../Store/useStackScreen";
import { useTranslation } from "react-i18next";

const Drawer = () => {
  const [isHidden, setIsHidden] = useState(true);
  const bounceValue = useRef(new Animated.Value(-500)).current;
  const { setStackScreen } = useStackScreenStore();
  const {t}= useTranslation()

  const _toggleSubview = useCallback(() => {
    let toValue = -500;
    if (isHidden) {
      toValue = 0;
    }
    Animated.spring(bounceValue, {
      toValue: toValue,
      velocity: 3,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsHidden(!isHidden);
  }, [isHidden]);

  return (
    <View>
      <IconButton
        icon="menu"
        size={24}
        containerColor="#fff"
        color="#000"
        onPress={_toggleSubview}
      />
      <Animated.View
        style={[
          drawerStyles.subView,
          { transform: [{ translateX: bounceValue }] },
        ]}
      >
        <View style={drawerStyles.subContainer}>
          <View style={drawerStyles.profileContainer}>
            <View style={drawerStyles.profileImageContainer}>
              <View style={drawerStyles.profileImage}>
                <FontAwesome5 name="user-tie" color={Colors.black} size={30} />
              </View>
            </View>
          </View>
          <View style={{marginTop:20}}>
          <TouchableOpacity style={drawerStyles.drawerBtns} onPress={()=>setStackScreen('savedRoutes')}>
            <Text style={drawerStyles.drawerBtnTxt}>{t("saved_routes")}</Text>
          </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={drawerStyles.iconClose}
          onPress={_toggleSubview}
        >
          <Ionicons name="close-sharp" color={Colors.black} size={25} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Drawer;

const styles = StyleSheet.create({});
