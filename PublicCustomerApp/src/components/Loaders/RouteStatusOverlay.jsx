import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

const RouteStatusOverlay = ({
  loading = false,
  error = null,
  onRetry,
  top = 0,
  left = 0,
  right = 0,
  bottom = 0,
}) => {
  if (!loading && !error) return null;

  return (
    <View style={[styles.container, { top, left, right, bottom }]}> 
      {loading && (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color="#0f223c" />
          <Text style={styles.message}>Fetching route…</Text>
        </View>
      )}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText} numberOfLines={2}>
            {typeof error === 'string' ? error : 'Failed to fetch route.'}
          </Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9,
    alignSelf: 'stretch',
    paddingHorizontal: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 4,
  },
  message: {
    marginLeft: 8,
    color: '#0f223c',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    width: '100%',
    marginTop: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 4,
  },
  errorText: {
    color: '#b00020',
    fontSize: 14,
    marginBottom: 8,
  },
  retryBtn: {
  
    backgroundColor: '#0f223c',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RouteStatusOverlay;
