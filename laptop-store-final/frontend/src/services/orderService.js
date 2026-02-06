import api from './api';

export const orderService = {
    // Create order
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get user orders
    getUserOrders: async (params = {}) => {
        try {
            const response = await api.get('/orders', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get order by ID
    getOrderById: async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Cancel order
    cancelOrder: async (id, reason) => {
        try {
            const response = await api.put(`/orders/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all orders (admin only)
    getAllOrders: async (params = {}) => {
        try {
            const response = await api.get('/orders/all', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update order status (admin only)
    updateOrderStatus: async (id, statusData) => {
        try {
            const response = await api.put(`/orders/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    // Get dashboard stats (admin only)
    getDashboardStats: async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get sales analytics (admin only)
    getSalesAnalytics: async (params = {}) => {
        try {
            const response = await api.get('/analytics/sales', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};