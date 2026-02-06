import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [featuredLaptops, setFeaturedLaptops] = useState([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch latest laptops or specific featured ones
                const res = await axios.get('http://localhost:5000/api/laptops?limit=6');
                setFeaturedLaptops(res.data.data);
            } catch (err) {
                console.error("Failed to fetch featured laptops");
            }
        };
        fetchFeatured();
    }, []);

    return (
        <Container className="py-5">
            <div className="p-5 mb-4 bg-light rounded-3 shadow-sm text-center">
                <h1 className="display-4 fw-bold">Welcome to Laptop Store</h1>
                <p className="lead">Find the best laptops at the best prices.</p>
                <Link to="/laptops" className="btn btn-primary btn-lg">Shop Now</Link>
            </div>

            <h2 className="mb-4 text-center">Featured Products</h2>
            <Row>
                {featuredLaptops.map(laptop => (
                    <Col key={laptop._id} md={4} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Img
                                variant="top"
                                src={laptop.images[0] || 'https://via.placeholder.com/300x200'}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{laptop.brand} {laptop.model}</Card.Title>
                                <div className="mb-2">
                                    <Badge bg="secondary" className="me-1">{laptop.category.name}</Badge>
                                    <Badge bg="success">${laptop.price}</Badge>
                                </div>
                                <Card.Text className="text-muted small">
                                    {laptop.specifications.processor}, {laptop.specifications.ram}
                                </Card.Text>
                                <Link to={`/laptops/${laptop._id}`} className="btn btn-outline-primary mt-auto">
                                    View Details
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <section className="py-5 bg-white rounded mt-5">
                <Row className="text-center">
                    <Col md={4}>
                        <h3>Fast Delivery</h3>
                        <p>Get your laptop delivered within 3-5 days.</p>
                    </Col>
                    <Col md={4}>
                        <h3>Secure Payment</h3>
                        <p>We support all major credit cards and PayPal.</p>
                    </Col>
                    <Col md={4}>
                        <h3>24/7 Support</h3>
                        <p>Our team is here to help you anytime.</p>
                    </Col>
                </Row>
            </section>
        </Container>
    );
};

export default Home;
