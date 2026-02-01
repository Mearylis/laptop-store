import React from 'react';
import { Container, Row, Col, Table, Button, Image, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    updateQuantity(id, newQty);
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any laptops yet.</p>
        <Link to="/laptops" className="btn btn-primary">Start Shopping</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Shopping Cart</h2>
      <Row>
        <Col md={8}>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item._id}>
                  <td style={{ minWidth: '250px' }}>
                    <div className="d-flex align-items-center">
                      <Image
                        src={item.images?.[0] || 'https://via.placeholder.com/80'}
                        thumbnail
                        style={{ width: '80px', marginRight: '15px' }}
                      />
                      <div>
                        <h6 className="mb-0">{item.brand} {item.model}</h6>
                        <small className="text-muted">{item.category?.name}</small>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle">${item.price}</td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td className="align-middle">${((item.price || 0) * item.quantity).toFixed(2)}</td>
                  <td className="align-middle">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFromCart(item._id)}
                    >
                      &times;
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>Cart Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal</span>
                <span>${(cartTotal || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span>{cartTotal > 1000 ? 'Free' : '$29.99'}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong>${((cartTotal || 0) + (cartTotal > 1000 ? 0 : 29.99)).toFixed(2)}</strong>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-100 mb-2"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="w-100"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
