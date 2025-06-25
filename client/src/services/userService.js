import api from './api';

const userService = {
  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getUserProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise} Updated user data
   */
  updateUserProfile: async (userData) => {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password data object with currentPassword and newPassword
   * @returns {Promise} Success message
   */
  changePassword: async (passwordData) => {
    const response = await api.post('/api/users/change-password', passwordData);
    return response.data;
  }
};

export default userService; 