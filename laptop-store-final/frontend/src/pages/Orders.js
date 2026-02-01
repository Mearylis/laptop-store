import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/orders/my-orders', config);
                setOrders(res.data.data);
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5">
            <h2 className="mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <Alert variant="info">You have no orders yet.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id}>
                                <td>{order.orderNumber || order._id}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>${(order.total || 0).toFixed(2)}</td>
                                <td>
                                    <Badge bg={
                                        order.status === 'delivered' ? 'success' :
                                            order.status === 'processing' ? 'primary' :
                                                order.status === 'cancelled' ? 'danger' : 'warning'
                                    }>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td>
                                    {order.items.map(item => (
                                        <div key={item._id}>{item.brand} {item.model} (x{item.quantity})</div>
                                    ))}
                                </td>
                                <td>
                                    {/* Link to detail if we want, for now just placeholder */}
                                    <Button variant="sm" disabled>View</Button>
                                    {order.status === 'pending' && (
                                        <Button variant="danger" size="sm" className="ms-2">Cancel</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Orders;
