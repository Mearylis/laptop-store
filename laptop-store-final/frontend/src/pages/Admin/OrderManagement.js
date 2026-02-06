import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Form } from 'react-bootstrap';
import { orderService } from '../../services/orderService';
import axios from 'axios';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderService.getAllOrders({});
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using direct axios call or need to add to service
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus }, config);
            fetchOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <Container fluid>
            <h1 className="mb-4">Order Management</h1>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order.orderNumber}</td>
                            <td>{order.userId?.email}</td>
                            <td>${order.total}</td>
                            <td>
                                <Badge bg="secondary">{order.status}</Badge>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Form.Select
                                    size="sm"
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </Form.Select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default OrderManagement;
