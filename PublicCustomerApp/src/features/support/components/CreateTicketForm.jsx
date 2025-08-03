import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useSupportStore from '../../../store/useSupportStore';
import { Fonts } from '../../../constants/constants';

const CreateTicketForm = ({ onSubmit, onCancel }) => {
  const { showPriority } = useSupportStore();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'technical', name: 'Technical Issue' },
    { id: 'billing', name: 'Billing & Payment' },
    { id: 'ride', name: 'Ride Related' },
    { id: 'account', name: 'Account & Profile' },
    { id: 'safety', name: 'Safety & Security' },
    { id: 'other', name: 'Other' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#10B981' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'high', name: 'High', color: '#EF4444' },
  ];

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

     return (
     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       <View style={styles.header}>
         <View style={styles.headerTop}>
           <TouchableOpacity
             style={styles.backButton}
             onPress={onCancel}
           >
             <Ionicons name="chevron-back" size={24} color="#000000" />
           </TouchableOpacity>
           <Text style={styles.title}>Create New Ticket</Text>
         </View>
         <Text style={styles.subtitle}>Describe your issue and we'll help you resolve it</Text>
       </View>

      <View style={styles.form}>
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
        {showPriority && (
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
        )}

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="send" size={16} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Create Ticket</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
     header: {
     padding: 20,
     backgroundColor: '#FFFFFF',
     borderBottomWidth: 1,
     borderBottomColor: '#E5E7EB',
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
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
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
});

export default CreateTicketForm; 