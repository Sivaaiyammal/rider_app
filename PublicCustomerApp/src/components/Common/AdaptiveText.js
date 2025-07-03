// LangText.js
import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { languageFontRatio } from '../../constants/constants';
import { colors } from '../../constants/constants';

const AdaptiveText = ({ style,color, children, ...props }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const ratio = languageFontRatio[lang] || 1;

  // Extract fontSize from style
  let fontSize = 14; // default
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
