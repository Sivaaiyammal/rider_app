// LangText.js
import React from 'react';
import { Text, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { languageFontRatio } from '../../constants/constants';
import { colors } from '../../constants/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdaptiveText = ({ style, color, children, ...props }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const ratio = languageFontRatio[lang] || 1;

  // Determine base font size considering both width and height for better scaling
  let baseFontSize = Math.min(screenWidth, screenHeight) * 0.045; // slightly larger for better readability

  // If style has fontSize, use it as base, else use calculated baseFontSize
  let fontSize = baseFontSize;
  if (style && style.fontSize) fontSize = style.fontSize;

  // Merge final style
  const mergedStyle = [
    style,
    { fontSize: fontSize * ratio },
    { color: color || colors.black },
  ];

  return (
    <Text style={mergedStyle} allowFontScaling={false} {...props}>
      {children}
    </Text>
  );
};

export default AdaptiveText;
