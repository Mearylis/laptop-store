import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        country: '',
        zipCode: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (cartItems.length === 0) {
            setError('Your cart is empty');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const orderData = {
                items: cartItems.map(item => ({
                    laptopId: item._id,
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod
            };

            await axios.post('http://localhost:5000/api/orders', orderData, config);
            clearCart();
            navigate('/profile'); // Redirect to profile/orders
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">Checkout</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header>Shipping Information</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit} id="checkout-form">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Label>Street Address</Form.Label>
                                        <Form.Control name="street" required onChange={handleChange} />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>City</Form.Label>
                                        <Form.Control name="city" required onChange={handleChange} />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Postal Code</Form.Label>
                                        <Form.Control name="zipCode" required onChange={handleChange} />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control name="country" required onChange={handleChange} />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control name="phone" required onChange={handleChange} />
                                    </Col>
                                </Row>

                                <h5 className="mt-4 mb-3">Payment Method</h5>
                                <Form.Check
                                    type="radio"
                                    label="Credit Card"
                                    name="paymentMethod"
                                    value="credit_card"
                                    checked={paymentMethod === 'credit_card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="PayPal"
                                    name="paymentMethod"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Cash on Delivery"
                                    name="paymentMethod"
                                    value="cash_on_delivery"
                                    checked={paymentMethod === 'cash_on_delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header>Order Summary</Card.Header>
                        <ListGroup variant="flush">
                            {cartItems.map(item => (
                                <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="my-0">{item.brand} {item.model}</h6>
                                        <small className="text-muted">Qty: {item.quantity}</small>
                                    </div>
                                    <span className="text-muted">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item className="d-flex justify-content-between">
                                <span>Total (USD)</span>
                                <strong>${(cartTotal || 0).toFixed(2)}</strong>
                            </ListGroup.Item>
                        </ListGroup>
                        <Card.Body>
                            <Button variant="primary" size="lg" className="w-100" type="submit" form="checkout-form" disabled={loading}>
                                {loading ? 'Processing...' : 'Place Order'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout;
