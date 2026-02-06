import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { FaLaptop, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { orderService } from '../../services/orderService';
import { laptopService } from '../../services/laptopService';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dashboard stats
            const statsResponse = await orderService.getDashboardStats();
            setStats(statsResponse.data);

            // Fetch recent orders
            const ordersResponse = await orderService.getAllOrders({
                limit: 5,
                page: 1
            });
            setRecentOrders(ordersResponse.data || []);

            // Fetch low stock laptops
            const laptopsResponse = await laptopService.getAllLaptops({
                limit: 5,
                sort: 'stock',
                order: 'asc'
            });
            setLowStock(laptopsResponse.data || []);
        } catch (error) {
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'warning',
            confirmed: 'info',
            processing: 'primary',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger'
        };
        return colors[status] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading dashboard...</p>
            </Container>
        );
    }

    return (
        <Container fluid>
            <h1 className="mb-4">Admin Dashboard</h1>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3} sm={6}>
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted">Total Sales</h6>
                                    <h3>${stats?.today?.todaySales?.toFixed(2) || '0.00'}</h3>
                                    <small className="text-muted">Today</small>
                                </div>
                                <FaLaptop size={40} className="text-primary" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} sm={6}>
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted">Total Orders</h6>
                                    <h3>{stats?.overview?.totalOrders || 0}</h3>
                                    <small className="text-muted">This month</small>
                                </div>
                                <FaShoppingCart size={40} className="text-success" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} sm={6}>
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted">Total Customers</h6>
                                    <h3>{stats?.overview?.totalCustomers || 0}</h3>
                                    <small className="text-muted">Registered users</small>
                                </div>
                                <FaUsers size={40} className="text-info" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} sm={6}>
                    <Card className="stat-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted">Active Products</h6>
                                    <h3>{stats?.overview?.activeProducts || 0}</h3>
                                    <small className="text-muted">In stock</small>
                                </div>
                                <FaDollarSign size={40} className="text-warning" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Recent Orders</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive>
                                <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order.orderNumber}</td>
                                        <td>{order.userId?.username || 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>${order.total.toFixed(2)}</td>
                                        <td>
                        <span className={`badge bg-${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Low Stock Alerts */}
                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Low Stock Alert</h5>
                        </Card.Header>
                        <Card.Body>
                            {lowStock.length === 0 ? (
                                <p className="text-muted mb-0">All products have sufficient stock.</p>
                            ) : (
                                <div>
                                    {lowStock.map(laptop => (
                                        <div key={laptop._id} className="d-flex align-items-center mb-3">
                                            <img
                                                src={laptop.images[0]}
                                                alt={laptop.model}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                            />
                                            <div>
                                                <h6 className="mb-0">{laptop.brand} {laptop.model}</h6>
                                                <small className="text-muted">Stock: {laptop.stock}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;