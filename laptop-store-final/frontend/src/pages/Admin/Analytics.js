import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { orderService } from '../../services/orderService';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await orderService.getSalesAnalytics({ period });
            setSalesData(res.data.salesData || []);
            setTopProducts(res.data.topLaptops || []);
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    // Chart Data Preparation
    const barChartData = {
        labels: salesData.map(d => d._id),
        datasets: [
            {
                label: 'Sales ($)',
                data: salesData.map(d => d.totalSales),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return (
        <Container fluid>
            <h1 className="mb-4">Analytics</h1>

            <Row className="mb-4">
                <Col md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5>Sales Overview</h5>
                            <Form.Select
                                style={{ width: '150px' }}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Form.Select>
                        </Card.Header>
                        <Card.Body>
                            <Bar options={{ responsive: true }} data={barChartData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header>Top Selling Products</Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Brand</th>
                                        <th>Units Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map(product => (
                                        <tr key={product.laptopId}>
                                            <td>{product.model}</td>
                                            <td>{product.brand}</td>
                                            <td>{product.totalSold}</td>
                                            <td>${product.totalRevenue.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Analytics;
