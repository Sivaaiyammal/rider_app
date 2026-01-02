/* eslint-disable react/react-in-jsx-scope */
import { Text } from "react-native";
import { Fonts } from "../constants/constants";


export default function WarningMiniText({text}) {
  const t = {}

  return (
    <Text style={{
        color: '#FFA500',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 10,
        fontFamily: Fonts.light
    }}>{t[text]}</Text>
  )
}