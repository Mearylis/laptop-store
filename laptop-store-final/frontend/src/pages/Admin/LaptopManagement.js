import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { laptopService } from '../../services/laptopService';

const LaptopManagement = () => {
    const [laptops, setLaptops] = useState([]);

    useEffect(() => {
        fetchLaptops();
    }, []);

    const fetchLaptops = async () => {
        try {
            const res = await laptopService.getAllLaptops({ limit: 100 });
            setLaptops(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Laptop Management</h1>
                <Button variant="success">Add New Laptop</Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {laptops.map(laptop => (
                        <tr key={laptop._id}>
                            <td>
                                <img src={laptop.images[0]} alt="laptop" style={{ width: '50px' }} />
                            </td>
                            <td>{laptop.brand}</td>
                            <td>{laptop.model}</td>
                            <td>${laptop.price}</td>
                            <td>
                                <Badge bg={laptop.stock > 0 ? 'success' : 'danger'}>
                                    {laptop.stock}
                                </Badge>
                            </td>
                            <td>
                                <Button variant="info" size="sm" className="me-2">Edit</Button>
                                <Button variant="danger" size="sm">Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default LaptopManagement;
