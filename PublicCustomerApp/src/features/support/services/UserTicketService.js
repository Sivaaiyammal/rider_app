import  apiClient  from '../../../API/APIClient';
import APIConfig from '../../../Config/APIURLConfig';
class UserTicketService {
  /**
   * Get all passenger tickets
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  static async getAllTickets(page = 1, limit = 10,status = 'all') {
  
    const response = await apiClient.get(`${APIConfig.PUBLICRIDEDASHBORAD_URL}/api/passenger-tickets?page=${page}&limit=${limit}`);

    return response?.data;
  }

  /**
   * Get ticket details by ID
   * @param {string} ticketId - Ticket ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  static async getTicketDetails(ticketId, params = {}) {
   
    const response = await apiClient.get(`${APIConfig.PUBLICRIDEDASHBORAD_URL}/api/passenger-tickets/${ticketId}`, { params });
    return response?.data;
  }

  /**
   * Add comment to a ticket
   * @param {string} ticketId - Ticket ID
   * @param {Object} commentData - Comment data
   * @returns {Promise} API response
   */
  static async addComment(ticketId, commentData) {
    const response = await apiClient.post(`/api/passenger-tickets/${ticketId}`, commentData);
    return response;
  }

  /**
   * Get ticket statistics
   * @returns {Promise} API response
   */
  static async getTicketStats() {
    const response = await apiClient.get('/api/passenger-tickets/stats');
    return response;
  }

  /**
   * Create a new ticket
   * @param {Object} ticketData - Ticket data
   * @returns {Promise} API response
   */
  static async createTicket(ticketData) {
    const response = await apiClient.post(`${APIConfig.PUBLICRIDEDASHBORAD_URL}/api/passenger-tickets`, ticketData);
    return response?.data;
  }

  static async addMessage(ticketId, messageText) {
    // Send as FormData (multipart/form-data)
    const formData = new FormData();
    formData.append('comment', messageText);
    // Debug: log the value, not the FormData object itself
    console.log('messageText', formData);
    const response = await apiClient.post(
      `${APIConfig.PUBLICRIDEDASHBORAD_URL}/api/passenger-tickets/${ticketId}/comments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response?.data;
  }
}

export default UserTicketService;
