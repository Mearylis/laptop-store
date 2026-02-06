import api from './api';

export const authService = {
  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/profile/password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add address
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/auth/profile/address', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      const response = await api.delete(`/auth/profile/address/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    try {
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: {
          'Content-Type': undefined
        }
      });
      // Update user in local storage to reflect new avatar
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && response.data.avatar) {
        user.profile.avatar = response.data.avatar;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};