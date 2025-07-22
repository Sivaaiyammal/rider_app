import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { Fonts } from '../../../constants/constants';
const RatingBox = ({ onRatingSubmit, title = "How is your Trips?", description = "Your feedback will help us improving driving experience better" }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleStarPress = (starIndex) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = () => {
    if (onRatingSubmit) {
      onRatingSubmit({
        rating,
        comment: comments.trim()
      });
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starContainer}
        >
          <Icon
            name={i < rating ? 'star' : 'star-border'}
            size={32}
            color={i < rating ? '#FFD700' : '#D3D3D3'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Dotted line */}
        <View style={styles.dottedLine} />
        
        {/* Description */}
        <Text style={styles.description}>{description}</Text>
        
        {/* Star Rating */}
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
        
        {/* Comments Input */}
        <TextInput
          style={styles.commentsInput}
          placeholder="Comments (Optional)"
          placeholderTextColor="#999"
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        {/* Submit Button */}
     
      </View>

      <TouchableOpacity 
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

RatingBox.propTypes = {
  onRatingSubmit: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
};

RatingBox.defaultProps = {
  title: "How is your Trips?",
  description: "Your feedback will help us improving driving experience better",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#bdbdbd',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily:Fonts.medium,
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  dottedLine: {
    height: 1,
   
    marginBottom: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
    borderStyle: 'dashed',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily:Fonts.regular
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  starContainer: {
    marginHorizontal: 4,
  },
  commentsInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
   
  
  },
  submitButton: {
    backgroundColor: '#237b53',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily:Fonts.medium
  },
});

export default RatingBox;
