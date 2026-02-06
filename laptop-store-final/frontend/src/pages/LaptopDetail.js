import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge, Card, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getLaptopById } from '../services/laptopService';
import axios from 'axios';

const LaptopDetail = () => {
    const { id } = useParams();
    const [laptop, setLaptop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [userTitle, setUserTitle] = useState('');
    const [userComment, setUserComment] = useState('');
    const [reviewError, setReviewError] = useState('');

    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchLaptop = async () => {
            try {
                const response = await getLaptopById(id);
                setLaptop(response.data);
                // Fetch reviews too
                try {
                    const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
                    setReviews(res.data.data);
                } catch (err) {
                    console.error("Failed to fetch reviews", err);
                }
            } catch (err) {
                setError('Failed to load laptop details');
            } finally {
                setLoading(false);
            }
        };
        fetchLaptop();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/reviews/${id}`, {
                rating: parseInt(userRating),
                title: userTitle,
                comment: userComment
            }, config);

            // Refresh reviews
            const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
            setReviews(res.data.data);
            setUserTitle('');
            setUserComment('');
            setReviewError('');
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        }
    };

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!laptop) return <Container className="py-5"><Alert variant="warning">Laptop not found</Alert></Container>;

    return (
        <Container className="py-5">
            <Link to="/laptops" className="btn btn-outline-secondary mb-4">&larr; Back to Laptops</Link>
            <Row>
                <Col md={6}>
                    <Image src={laptop.images?.[0] || 'https://via.placeholder.com/600'} fluid rounded className="shadow-sm mb-4" />
                    <Row>
                        {laptop.images?.slice(1).map((img, idx) => (
                            <Col xs={3} key={idx} className="mb-2">
                                <Image src={img} fluid rounded thumbnail />
                            </Col>
                        ))}
                    </Row>
                </Col>
                <Col md={6}>
                    <h1 className="display-5">{laptop.brand} {laptop.model}</h1>
                    <div className="mb-3">
                        <Badge bg="info" className="me-2">{laptop.category?.name || 'Uncategorized'}</Badge>
                        <span className="text-warning">
                            {'★'.repeat(Math.round(laptop.ratings?.average || 0))} ({laptop.ratings?.count || 0} reviews)
                        </span>
                    </div>
                    <h2 className="text-primary mb-4">${laptop.price}</h2>
                    <p className="lead">{laptop.description}</p>

                    <Card className="mb-4">
                        <Card.Header>Specifications</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>Processor:</strong> {laptop.specifications?.processor || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>RAM:</strong> {laptop.specifications?.ram || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Storage:</strong> {laptop.specifications?.storage || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Display:</strong> {laptop.specifications?.display || 'N/A'}</ListGroup.Item>
                            <ListGroup.Item><strong>Graphics:</strong> {laptop.specifications?.graphics || 'N/A'}</ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={laptop.stock === 0}
                        onClick={() => addToCart(laptop)}
                    >
                        {laptop.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={12}>
                    <h3>Reviews</h3>
                    <hr />
                    {user ? (
                        <Card className="mb-4">
                            <Card.Body>
                                <h5>Write a Review</h5>
                                {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                                <Form onSubmit={handleReviewSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Rating</Form.Label>
                                        <Form.Select value={userRating} onChange={(e) => setUserRating(e.target.value)}>
                                            <option value="5">5 - Excellent</option>
                                            <option value="4">4 - Very Good</option>
                                            <option value="3">3 - Good</option>
                                            <option value="2">2 - Fair</option>
                                            <option value="1">1 - Poor</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Comment</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={userTitle}
                                            onChange={(e) => setUserTitle(e.target.value)}
                                            required
                                            placeholder="Summarize your experience"
                                        />
                                    </Form.Group>
                                    <Button type="submit" variant="success">Submit Review</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Alert variant="info">Please <Link to="/login">login</Link> to write a review.</Alert>
                    )}

                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        reviews.map(review => (
                            <Card key={review._id} className="mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h5>{(review.userId && (review.userId.firstName || review.userId.username)) || 'User'}</h5>
                                            <strong>{review.title}</strong>
                                        </div>
                                        <span className="text-warning">{'★'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="text-muted small">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    <p>{review.comment}</p>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default LaptopDetail;
