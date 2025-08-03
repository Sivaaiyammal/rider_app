import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SupportCard from '../components/SupportCard';
import CreateTicketForm from '../components/CreateTicketForm';
import SkeletonLoader from '../components/SkeletonLoader';
import useSupportStore from '../../../store/useSupportStore';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import { Fonts } from '../../../constants/constants';

const SupportScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const {
    tickets,
    isLoading,
    error,
    unreadCount,
    calculateUnreadCount,
    searchTickets,
    getTicketsByStatus,
    createTicketAsync,
    simulateAgentResponse,
    showPriority,
    setShowPriority,
  } = useSupportStore();

  const { setStackScreen,reset } = useStackScreenStore();

  useEffect(() => {
    calculateUnreadCount();
  }, [tickets]);

  useEffect(() => {
    let filtered = [];
    
    if (searchQuery.trim()) {
      filtered = searchTickets(searchQuery);
    } else if (activeTab === 'all') {
      filtered = tickets;
    } else {
      filtered = getTicketsByStatus(activeTab);
    }
    
    setFilteredTickets(filtered);
  }, [searchQuery, activeTab, tickets]);

  const handleCreateTicket = async (ticketData) => {
    try {
      await createTicketAsync(ticketData);
      setShowCreateForm(false);
      Alert.alert('Success', 'Ticket created successfully!');
      
      // Simulate agent response
      setTimeout(() => {
        simulateAgentResponse(ticketData.ticketId);
      }, 2000);
      
      // Navigate to ticket detail
      setStackScreen('TicketDetailScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    }
  };

  const handleTicketPress = (ticket) => {
    useSupportStore.getState().setSelectedTicket(ticket);
    setStackScreen('TicketDetailScreen');
  };

  const getStatusCount = (status) => {
    if (status === 'all') return tickets.length;
    return getTicketsByStatus(status).length;
  };

  const renderTabButton = (tab, label, count) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
      <View style={[styles.countBadge, activeTab === tab && styles.activeCountBadge]}>
        <Text style={[styles.countText, activeTab === tab && styles.activeCountText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTicket = ({ item }) => (
    <SupportCard
      ticket={item}
      onPress={handleTicketPress}
    />
  );

  if (showCreateForm) {
    return (
      <CreateTicketForm
        onSubmit={handleCreateTicket}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => reset()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
                     <View style={styles.headerActions}>
             <TouchableOpacity
               style={styles.priorityToggle}
               onPress={() => setShowPriority(!showPriority)}
             >
               <Ionicons 
                 name={showPriority ? "flag" : "flag-outline"} 
                 size={20} 
                 color={showPriority ? "#000000" : "#6B7280"} 
               />
             </TouchableOpacity>
           </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Ionicons name="notifications" size={16} color="#FFFFFF" />
            <Text style={styles.notificationText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('all', 'All', getStatusCount('all'))}
          {renderTabButton('open', 'Open', getStatusCount('open'))}
          {renderTabButton('in_progress', 'In Progress', getStatusCount('in_progress'))}
          {renderTabButton('resolved', 'Resolved', getStatusCount('resolved'))}
          {renderTabButton('closed', 'Closed', getStatusCount('closed'))}
        </ScrollView>
      </View>

             {/* Content */}
       <View style={styles.content}>
         {isLoading ? (
           <SkeletonLoader />
         ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first support ticket'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.createFirstButtonText}>Create Ticket</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTickets}
            renderItem={renderTicket}
            keyExtractor={(item) => item.ticketId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
                 )}
       </View>
       
       {/* Floating Action Button */}
       <TouchableOpacity
         style={styles.fab}
         onPress={() => setShowCreateForm(true)}
       >
         <Ionicons name="add" size={24} color="#FFFFFF" />
       </TouchableOpacity>
     </View>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityToggle: {
    padding: 4,
  },
  createButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#1F2937',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 20,
    justifyContent: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.semi_bold,
    marginLeft: 2,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingLeft: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
     activeTabButton: {
     backgroundColor: '#000000',
   },
  tabText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: '#FFFFFF',
  },
  countText: {
    fontSize: 10,
    fontFamily: Fonts.semi_bold,
    color: '#6B7280',
  },
     activeCountText: {
     color: '#000000',
   },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.semi_bold,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
     createFirstButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#000000',
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderRadius: 8,
   },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    marginLeft: 6,
  },
     listContainer: {
     padding: 20,
   },
   fab: {
     position: 'absolute',
     bottom: 20,
     right: 20,
     width: 56,
     height: 56,
     borderRadius: 28,
     backgroundColor: '#000000',
     justifyContent: 'center',
     alignItems: 'center',
     elevation: 8,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 4,
     },
     shadowOpacity: 0.3,
     shadowRadius: 4.65,
   },
 });

export default SupportScreen; 