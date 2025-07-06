import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SkeletonLoader from './Loaders/SkeletonLoader';

const ITEM_HEIGHT = 50;

const WaypointContainer = ({ waypoints }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(waypoints.length-1,"waypoints");
  const [lastAddStopIndex, setLastAddStopIndex] = useState(waypoints.length-1);
  
  useEffect(() => {
    setLastAddStopIndex(waypoints.length-1);
  }, [waypoints]);
  
  useEffect(() => {
    const transformedData = waypoints.map((item, index) => ({
      ...item,
      type: index === 0 ? 'pickup' : 'waypoint',
    }));
    setData(transformedData);
    
    // Simulate loading time for skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [waypoints]);

  const finalData = useMemo(() => {
    if (data.length === 0) return [];

    const addStopItem = { type: 'add-stop', key: 'add-stop', id: 'add-stop' };
    console.log(lastAddStopIndex,"lastAddStopIndex");
    if (data.length < 6) {
      const newData = [...data];
      if (!newData.find(d => d.id === 'add-stop')) {
        newData.splice(lastAddStopIndex, 0, addStopItem);
      }
      return newData;
    }

    return data;
  }, [data, lastAddStopIndex]);

  const handleReorder = useCallback(({ data: reorderedData }) => {
    // Process the reordered data immediately without delay
    const lastAddStopIndex = reorderedData.findIndex(item => item.type === 'add-stop');
    const filteredData = reorderedData.filter(item => item.type !== 'add-stop');
    
    if (filteredData.length > 0) {
      const processedData = filteredData.map((item, index) => ({
        ...item,
        type: index === 0 ? 'pickup' : 'waypoint',
      }));

      // Use React's automatic batching for smoother updates
      setData([...processedData]);
      setLastAddStopIndex(lastAddStopIndex);
    }
  }, []);

  const handleAddWaypoint = useCallback(() => {
    const newWaypoint = {
      id: `waypoint-${Date.now()}`,
      name: 'New Stop',
      address: 'Tap to add location',
      type: 'waypoint'
    };

    setData(currentData => {
      const currentFinalData = [...currentData];
      if (currentData.length < 6) {
        const addStopItem = { type: 'add-stop', key: 'add-stop', id: 'add-stop' };
        if (!currentFinalData.find(d => d.id === 'add-stop')) {
          currentFinalData.splice(lastAddStopIndex, 0, addStopItem);
        }
      }
      
      const AddStopIndex = currentFinalData.findIndex(item => item.type === 'add-stop');
      const updatedData = [...currentData];
      updatedData.splice(AddStopIndex, 0, newWaypoint);
      
      setLastAddStopIndex(AddStopIndex + 1);
      return updatedData;
    });
  }, [lastAddStopIndex]);

  const handleRemoveWaypoint = useCallback((index) => {
    setData(currentData => currentData.filter((_, i) => i !== index));
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }) => {
    if (item.type === 'add-stop') {
      return (
        <View style={[styles.row]}>
          <TouchableOpacity 
            style={styles.draggableArea}
            onPress={handleAddWaypoint}
            onLongPress={drag}
            delayLongPress={100}
          >
            <View style={[styles.AddressContainer,isActive && styles.draggingItem]}>
            <View style={styles.labelCol}>
              <Text style={styles.addLabel}>Add a Stop</Text>
            </View>
            <View style={styles.actionCol}>
              <MaterialIcons name="drag-handle" size={24} color="black" />
            </View>
            </View>
            <View style={styles.actionBtn}>
               <Text style={[styles.removeText, {color: 'transparent'}]}>×</Text>
               
            </View>
          </TouchableOpacity>
         
        </View>
      );
    }

    const isWaypoint = item.type === 'waypoint';
    const actualIndex = data.findIndex(dataItem => dataItem.id === item.id);

    return (
      <View style={[styles.row]}>
        <TouchableOpacity
          style={styles.draggableArea}
          onLongPress={drag}
          delayLongPress={100}
        >
          <View style={[styles.AddressContainer,isActive && styles.draggingItem]}>
          <View style={styles.labelCol}>
            <Text style={styles.labelText} numberOfLines={1}>
            {item.address}
            </Text>
           
          </View>

          <View style={styles.actionCol}>
           
            <MaterialIcons name="drag-handle" size={24} color="black" />
          </View>
          </View>
          {isWaypoint ?(
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleRemoveWaypoint(actualIndex)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            ):
            <View style={styles.actionBtn}>
               <Text style={[styles.removeText, {color: 'transparent'}]}>×</Text>
               
            </View>
            }
        </TouchableOpacity>
      </View>
    );
  }, [data, handleAddWaypoint, handleRemoveWaypoint]);

  const renderSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: Math.max(2, waypoints.length) }, (_, index) => index);
    
    return (
      <View style={styles.container}>
        <View>
          <View style={styles.iconContainer}>
            {skeletonItems.map((_, index) => (
              <View key={index} style={styles.iconItemContainer}>
                <View style={[styles.line, index === 0 && { borderColor: 'transparent', borderWidth: 1 }]} />
                <View style={styles.iconItem}>
                  <SkeletonLoader width={25} height={25} borderRadius={15} />
                </View>
                <View style={[styles.line, index === skeletonItems.length - 1 && { borderColor: 'transparent' }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.listContainer}>
          {skeletonItems.map((_, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.draggableArea}>
                <View style={styles.AddressContainer}>
                  <View style={styles.labelCol}>
                    <SkeletonLoader width="80%" height={16} borderRadius={4} />
                  </View>
                  <View style={styles.actionCol}>
                    <SkeletonLoader width={24} height={24} borderRadius={4} />
                  </View>
                </View>
                <View style={styles.actionBtn}>
                  <SkeletonLoader width={20} height={20} borderRadius={10} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderIcon = (data) => {
    return (
      <View style={styles.iconContainer}>
        {data.map((item, index) => {
          return (
            <View key={index} style={styles.iconItemContainer}>
              <View style={[styles.line, index == 0 && { borderColor: 'transparent', borderWidth: 1 }]} />
              {index == 0 ?
                <View style={[styles.iconItem, {backgroundColor: "#4caf50"+"30"}]}>
                  <View style={styles.iconSubItem} />
                </View>
                :index == data.length-1 ?
                <View style={[styles.iconItem, { backgroundColor: "#ff5151"+"30" }]} >
                  <View style={[styles.iconSubItem, { backgroundColor: "#ff5151" }]} />
                </View>
                :
                <View style={styles.iconItem}>
                  <Text style={styles.iconText}>{index}</Text>
                </View>
              }
              <View style={[styles.line, index == data.length - 1 && { borderColor: 'transparent' }]} />
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return renderSkeletonLoader();
  }

  return (
    <View style={styles.container}>
      <View>
        {renderIcon(finalData)}
      </View>
      <View style={styles.listContainer}>
        <DraggableFlatList
          data={finalData}
          keyExtractor={(item) => item.id?.toString() || `item-${item.key}`}
          renderItem={renderItem}
          onDragEnd={handleReorder}
          scrollEnabled={true}
          dragItemOverflow={true}
          contentContainerStyle={styles.listContent}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          // Add these props for smoother animations
          autoscrollSpeed={100}
          autoscrollThreshold={30}
        />
      </View>
    </View>
  );
};

WaypointContainer.propTypes = {
  waypoints: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '94%',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 5,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
   
    height: ITEM_HEIGHT,
    
    
  },
  draggingItem: {
    opacity: 0.6,
    backgroundColor: '#f6f6f6',
    
  },
  iconCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableArea: {
    
    flexDirection: 'row',
    marginVertical: 0,
  
    
  },
  AddressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor:"#f2f2f2",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  roundLocation: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc40',
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  labelCol: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  labelText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#888',
    fontSize: 25,
    fontWeight: 'bold',
  },
  dragText: {
    color: '#bbb',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  addLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
    marginLeft: 2,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
   
    flexGrow: 1,
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconItemContainer: {
    display: 'flex',
    minHeight: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    
    
  },
  iconItem: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSubItem: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#4caf50',
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  line: {
    width: 1,
    flex: 1,
    borderLeftWidth:1,
    borderStyle:"dashed",
    borderColor:"grey"
  },
  
});

export default WaypointContainer;