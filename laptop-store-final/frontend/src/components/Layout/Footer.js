import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4 mt-auto">
            <Container className="text-center">
                <p className="mb-0">&copy; {new Date().getFullYear()} Laptop Store. All Rights Reserved.</p>
            </Container>
        </footer>
    );
};

export default Footer;
