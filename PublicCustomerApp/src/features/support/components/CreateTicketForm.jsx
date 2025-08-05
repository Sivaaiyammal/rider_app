import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useSupportStore from '../store/useSupportStore';
import { Fonts } from '../../../constants/constants';

const CreateTicketForm = ({ onSubmit, onCancel }) => {
  const { showPriority } = useSupportStore();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    ticketType: 'app', // 'trip' or 'app'
    selectedTrip: null,
  });

  const [errors, setErrors] = useState({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const tripSelectionOpacity = useRef(new Animated.Value(0)).current;
  const tripSelectionHeight = useRef(new Animated.Value(0)).current;
  const tripDetailsOpacity = useRef(new Animated.Value(0)).current;
  const tripDetailsHeight = useRef(new Animated.Value(0)).current;

  // Mock trip data - in real app, this would come from API
  const [availableTrips] = useState([
    {
      _id: '6881e98eee9826034491629b',
      bookingTime: 1726120926843,
      fare: 100,
      distance: 10,
      duration: 20,
      trip_type: 'pickup',
      driver_name: 'John Doe',
      vehicleType: 'bike',
      startLocation: {
        address: 'Kolkata, West Bengal'
      },
      endLocation: {
        address: 'Mumbai, Maharashtra'
      },
    },
    {
      _id: 'trip_2',
      bookingTime: 1726120926844,
      fare: 150,
      distance: 15,
      duration: 25,
      trip_type: 'pickup',
      driver_name: 'Jane Smith',
      vehicleType: 'auto',
      startLocation: {
        address: 'Delhi, India'
      },
      endLocation: {
        address: 'Gurgaon, Haryana'
      },
    },
  ]);

  const categories = [
    { id: '688f955e6916c287b05d6f32', name: 'Trip Fare Issues' },
    { id: '688f955e6916c287b05d6f38', name: 'Driver App Issues' },
   
  ];

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Animate trip selection when ticket type changes
  useEffect(() => {
    if (formData.ticketType === 'trip') {
      // Animate in
      Animated.parallel([
        Animated.timing(tripSelectionOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(tripSelectionHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(tripSelectionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(tripSelectionHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [formData.ticketType]);

  // Animate trip details when trip is selected
  useEffect(() => {
    if (formData.selectedTrip) {
      Animated.parallel([
        Animated.timing(tripDetailsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(tripDetailsHeight, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tripDetailsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(tripDetailsHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [formData.selectedTrip]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Validate trip selection if ticket type is trip
    if (formData.ticketType === 'trip' && !formData.selectedTrip) {
      newErrors.selectedTrip = 'Please select a trip';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'open',
        ticketId: `TKT${Date.now()}`,
      });
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatTripDisplay = (trip) => {
    const date = new Date(trip.bookingTime);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${trip.startLocation.address} → ${trip.endLocation.address} (${formattedDate})`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

     return (
     <KeyboardAvoidingView 
       style={styles.container}
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
     >
       {/* Fixed Header */}
       <View style={styles.fixedHeader}>
         <View style={styles.headerTop}>
           <TouchableOpacity
             style={styles.backButton}
             onPress={onCancel}
           >
             <Ionicons name="chevron-back" size={24} color="#000000" />
           </TouchableOpacity>
           <Text style={styles.title}>Create New Ticket</Text>
         </View>
         <Text style={styles.subtitle}>Describe your issue and we&apos;ll help you resolve it</Text>
       </View>

      {/* Scrollable Form Content */}
      <ScrollView 
        style={styles.scrollableContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContentContainer,
          keyboardVisible && styles.scrollContentContainerKeyboard
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Ticket Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ticket Type *</Text>
            <View style={styles.ticketTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.ticketTypeButton,
                  formData.ticketType === 'app' && styles.ticketTypeButtonActive,
                ]}
                onPress={() => updateFormData('ticketType', 'app')}
              >
                <Ionicons 
                  name="phone-portrait" 
                  size={16} 
                  color={formData.ticketType === 'app' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text
                  style={[
                    styles.ticketTypeButtonText,
                    formData.ticketType === 'app' && styles.ticketTypeButtonTextActive,
                  ]}
                >
                  App Related
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ticketTypeButton,
                  formData.ticketType === 'trip' && styles.ticketTypeButtonActive,
                ]}
                onPress={() => updateFormData('ticketType', 'trip')}
              >
                <Ionicons 
                  name="car" 
                  size={16} 
                  color={formData.ticketType === 'trip' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text
                  style={[
                    styles.ticketTypeButtonText,
                    formData.ticketType === 'trip' && styles.ticketTypeButtonTextActive,
                  ]}
                >
                  Trip Related
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip Selection Dropdown - Only show when ticket type is trip */}
          <Animated.View 
            style={[
              styles.inputGroup,
              {
                opacity: tripSelectionOpacity,
                maxHeight: tripSelectionHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 300],
                }),
                overflow: 'hidden',
              }
            ]}
          >
            <Text style={styles.label}>Select Trip *</Text>
            {availableTrips.length > 0 ? (
              <TouchableOpacity
                style={[styles.dropdownButton, errors.selectedTrip && styles.inputError]}
                onPress={() => {
                  // In a real app, you might want to show a modal or navigate to trip selection
                  Alert.alert(
                    'Select Trip',
                    'Choose a trip from your ride history',
                    availableTrips.map(trip => ({
                      text: formatTripDisplay(trip),
                      onPress: () => updateFormData('selectedTrip', trip)
                    }))
                  );
                }}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !formData.selectedTrip && styles.placeholderText
                ]}>
                  {formData.selectedTrip 
                    ? formatTripDisplay(formData.selectedTrip)
                    : 'Select a trip from your ride history'
                  }
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            ) : (
              <View style={styles.noTripsContainer}>
                <Ionicons name="car-outline" size={24} color="#9CA3AF" />
                <Text style={styles.noTripsText}>No trips in history</Text>
                <Text style={styles.noTripsSubtext}>You don&apos;t have any completed trips yet</Text>
              </View>
            )}
            {errors.selectedTrip && <Text style={styles.errorText}>{errors.selectedTrip}</Text>}
            
            {/* Show selected trip details with animation */}
            <Animated.View 
              style={[
                styles.tripDetailsContainer,
                {
                  opacity: tripDetailsOpacity,
                  maxHeight: tripDetailsHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                  overflow: 'hidden',
                }
              ]}
            >
              <Text style={styles.tripDetailsTitle}>Trip Details:</Text>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>From:</Text>
                <Text style={styles.tripDetailValue}>{formData.selectedTrip?.startLocation.address}</Text>
              </View>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>To:</Text>
                <Text style={styles.tripDetailValue}>{formData.selectedTrip?.endLocation.address}</Text>
              </View>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>Date:</Text>
                <Text style={styles.tripDetailValue}>{formData.selectedTrip ? formatDate(formData.selectedTrip.bookingTime) : ''}</Text>
              </View>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>Fare:</Text>
                <Text style={styles.tripDetailValue}>₹{formData.selectedTrip?.fare}</Text>
              </View>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>Distance:</Text>
                <Text style={styles.tripDetailValue}>{formData.selectedTrip?.distance} km</Text>
              </View>
              <View style={styles.tripDetailRow}>
                <Text style={styles.tripDetailLabel}>Driver:</Text>
                <Text style={styles.tripDetailValue}>{formData.selectedTrip?.driver_name}</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChangeText={(text) => updateFormData('subject', text)}
              maxLength={100}
            />
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.category === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateFormData('category', category.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Priority */}
          {/* {showPriority && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority.id && styles.priorityButtonActive,
                      { borderColor: priority.color },
                    ]}
                    onPress={() => updateFormData('priority', priority.id)}
                  >
                    <View
                      style={[
                        styles.priorityIndicator,
                        { backgroundColor: priority.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityButtonText,
                        formData.priority === priority.id && styles.priorityButtonTextActive,
                      ]}
                    >
                      {priority.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )} */}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Please provide detailed information about your issue..."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View style={styles.fixedBottom}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Create Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#6B7280',
  },
  scrollableContent: {
    flex: 1,
    marginTop: 120, // Space for fixed header
  },
  scrollContentContainer: {
    paddingBottom: 120, // Space for fixed bottom buttons
  },
  scrollContentContainerKeyboard: {
    paddingBottom: 200, // Adjust for keyboard
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#1F2937',
    minHeight: 120,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  ticketTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ticketTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  ticketTypeButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  ticketTypeButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#6B7280',
  },
  ticketTypeButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.medium,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#1F2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  tripDetailsContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  tripDetailsTitle: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#374151',
    marginBottom: 8,
  },
  tripDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tripDetailLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#6B7280',
    width: 60,
  },
  tripDetailValue: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#1F2937',
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
     categoryButtonActive: {
     backgroundColor: '#000000',
     borderColor: '#000000',
   },
  categoryButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.medium,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#6B7280',
  },
  priorityButtonTextActive: {
    color: '#92400E',
    fontFamily: Fonts.medium,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#6B7280',
  },
     submitButton: {
     flex: 2,
     backgroundColor: '#000000',
     paddingVertical: 12,
     borderRadius: 8,
     alignItems: 'center',
     flexDirection: 'row',
     justifyContent: 'center',
   },
  submitButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  noTripsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  noTripsText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#374151',
    marginTop: 10,
  },
  noTripsSubtext: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default CreateTicketForm; 