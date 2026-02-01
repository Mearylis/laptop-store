import api from './api';

export const laptopService = {
    // Get all laptops with filters
    getAllLaptops: async (params = {}) => {
        try {
            const response = await api.get('/laptops', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get laptop by ID
    getLaptopById: async (id) => {
        try {
            const response = await api.get(`/laptops/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create laptop (admin only)
    createLaptop: async (laptopData) => {
        try {
            const response = await api.post('/laptops', laptopData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update laptop (admin only)
    updateLaptop: async (id, laptopData) => {
        try {
            const response = await api.put(`/laptops/${id}`, laptopData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete laptop (admin only)
    deleteLaptop: async (id) => {
        try {
            const response = await api.delete(`/laptops/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update stock (admin only)
    updateStock: async (id, quantity) => {
        try {
            const response = await api.patch(`/laptops/${id}/stock`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get laptop statistics (admin only)
    getLaptopStats: async () => {
        try {
            const response = await api.get('/laptops/stats/analytics');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get categories
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create review
    createReview: async (laptopId, reviewData) => {
        try {
            const response = await api.post(`/laptops/${laptopId}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update review
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await api.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete review
    deleteReview: async (reviewId) => {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export const {
    getAllLaptops,
    getLaptopById,
    createLaptop,
    updateLaptop,
    deleteLaptop,
    updateStock,
    getLaptopStats,
    getCategories,
    createReview,
    updateReview,
    deleteReview
} = laptopService;
