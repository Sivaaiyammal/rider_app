import React, {useRef, useState, useMemo} from 'react';
import {StyleSheet, PanResponder, Animated} from 'react-native';

const DragAndDropCard = ({
  index,
  onDrag,
  onDragEnd,
  children,
  length,
  topOffset,
}) => {
  // Create a ref to store the position of the card
  const position = useRef(new Animated.ValueXY()).current;

  // State to track if the card is being dragged
  const [dragging, setDragging] = useState(false);

  const calculateDropIndex = (
    gestureState,
    itemHeight,
    dataLength,
    topOffset = 20,
  ) => {
    // You need to adjust this calculation based on your layout
    const dragY = gestureState.moveY - topOffset;

    // Calculate the approximate index based on the item's height
    let estimatedIndex = Math.floor(dragY / itemHeight);

    // Clamp the index between 0 and the length of the data array - 1
    estimatedIndex = Math.max(0, Math.min(estimatedIndex, dataLength - 1));

    console.log(
      'estimatedIndex',
      estimatedIndex,
      dragY,
      gestureState.moveY,
      gestureState.dy,
    );
    const dropIndex = Math.floor(gestureState.dy / itemHeight);

    console.log('dropIndex', dropIndex);

    return estimatedIndex;
  };

  // Create a pan responder to handle touch events
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
          [
            null,
            {
              dx: position.x,
              dy: position.y,
            },
          ],
          {useNativeDriver: false},
        ),
        onPanResponderRelease: (e, gestureState) => {
          setDragging(false);

          // Calculate the drop index based on the gestureState
          const dropIndex = calculateDropIndex(
            gestureState,
            40,
            length,
            topOffset,
          );

          console.log('dropIndex', dropIndex, index);

          // to check whether the drag is happend minimum
          const movedSlightly = Math.abs(gestureState.dy) < 10;

          onDragEnd(index, dropIndex, movedSlightly);

          // Reset position to zero
          Animated.spring(position, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();
        },
      }),
    [index, onDragEnd],
  );

  return (
    <Animated.View
      style={[
        {
          transform: position.getTranslateTransform(),
          opacity: dragging ? 0.8 : 1,
        },
      ]}
      {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cardContainer: {
    marginTop: 20,
  },
  card: {
    width: '90%',
    height: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
  },
});
export default DragAndDropCard;

