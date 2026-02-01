import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const LaptopCard = ({ laptop }) => {
  const { addToCart } = useCart();

  return (
    <Card className="h-100 shadow-sm border-0 product-card">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={laptop.images[0] || 'https://via.placeholder.com/300x200'}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {laptop.discount > 0 && (
          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
            -{laptop.discount}%
          </Badge>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate">
          {laptop.brand} {laptop.model}
        </Card.Title>
        <div className="mb-2">
          <Badge bg="secondary" className="me-1">{laptop.category?.name}</Badge>
          <small className="text-muted">
            ⭐ {laptop.ratings?.average || 0} ({laptop.ratings?.count || 0})
          </small>
        </div>
        <Card.Text className="text-muted small mb-3">
          {laptop.specifications?.processor}, {laptop.specifications?.ram}
        </Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="h5 mb-0 fw-bold">${laptop.price}</span>
            {laptop.discount > 0 && (
              <small className="text-muted text-decoration-line-through ms-2">
                ${(laptop.price / (1 - laptop.discount / 100)).toFixed(0)}
              </small>
            )}
          </div>
          <div className="d-flex gap-2">
            <Link to={`/laptops/${laptop._id}`} className="btn btn-outline-primary btn-sm">
              View
            </Link>
            <Button
              variant="primary"
              size="sm"
              disabled={laptop.stock === 0}
              onClick={() => addToCart(laptop)}
            >
              {laptop.stock > 0 ? 'Add' : 'Out'}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LaptopCard;
