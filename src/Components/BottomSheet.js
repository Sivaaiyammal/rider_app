import React, {useRef} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {Modalize} from 'react-native-modalize';
import PropTypes from 'prop-types';

const BottomSheet = React.memo(({children, minHeight, maxHeight}) => {
  const modalizeRef = useRef(null);

  return (
    <Modalize
      ref={modalizeRef}
      alwaysOpen={minHeight || 300}
      childrenStyle={{height: maxHeight || 700}}
      adjustToContentHeight={false}
      handlePosition="inside"
      withOverlay={true}>
      <KeyboardAvoidingView behavior={null}>
        <View style={{paddingTop: 20}}></View>
        {children}
      </KeyboardAvoidingView>
    </Modalize>
  );
});

export default BottomSheet;

BottomSheet.propTypes = {
  children: PropTypes.any,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number
};

BottomSheet.defaultProps = {
  children: <></>,
  minHeight: 300,
  maxHeight: 700
};
