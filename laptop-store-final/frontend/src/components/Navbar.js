import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Laptop Store</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/laptops">Laptops</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/cart">
              Cart <Badge bg="secondary">{cartCount}</Badge>
            </Nav.Link>

            {user ? (
              <NavDropdown title={`Hi, ${user.firstName || user.username || 'User'}`} id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/analytics">Analytics</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
