import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Tab, Tabs, ListGroup, Badge, Image, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Profile = () => {
    const { user, login, uploadAvatar } = useAuth();
    const [key, setKey] = useState('info');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Profile Data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    // Password Data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Address Data
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        country: '',
        zipCode: ''
    });

    // Avatar
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfileData({
                firstName: data.user.profile?.firstName || '',
                lastName: data.user.profile?.lastName || '',
                phone: data.user.profile?.phone || '',
                email: data.user.email || ''
            });
            setAddresses(data.user.addresses || []);
            // Update auth context user if needed, or rely on getProfile data
        } catch (err) {
            console.error('Profile Load Error:', err);
            setError('Failed to load profile data: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateProfile(profileData);
            setMessage('Profile updated successfully');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage('Password changed successfully');
            setError('');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.addAddress(newAddress);
            setAddresses(response.addresses);
            setShowAddressModal(false);
            setNewAddress({ street: '', city: '', country: '', zipCode: '' });
            setMessage('Address added successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const response = await authService.deleteAddress(id);
            setAddresses(response.addresses);
            setMessage('Address deleted successfully');
        } catch (err) {
            setError('Failed to delete address');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await uploadAvatar(formData);
            setMessage('Avatar updated successfully');
            // No reload needed, context updates state
        } catch (err) {
            console.error('Avatar upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload avatar');
        }
    };

    const getAvatarUrl = () => {
        if (user?.profile?.avatar) {
            if (user.profile.avatar.startsWith('http')) return user.profile.avatar;
            return `http://localhost:5000${user.profile.avatar}`;
        }
        return 'https://via.placeholder.com/150';
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={10}>
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <div className="position-relative d-inline-block">
                                <Image
                                    src={getAvatarUrl()}
                                    roundedCircle
                                    width={100}
                                    height={100}
                                    className="mb-3 object-fit-cover"
                                />
                                <Form.Group className="position-absolute bottom-0 end-0">
                                    <Form.Label htmlFor="avatar-upload" className="btn btn-sm btn-primary rounded-circle" style={{ cursor: 'pointer' }}>
                                        <i className="fas fa-camera"></i>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                </Form.Group>
                            </div>
                            <h3>{user?.username}</h3>
                            <p className="text-muted">{user?.email}</p>
                        </Card.Body>
                    </Card>

                    {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                    <Card>
                        <Card.Body>
                            <Tabs
                                id="profile-tabs"
                                activeKey={key}
                                onSelect={(k) => setKey(k)}
                                className="mb-4"
                            >
                                <Tab eventKey="info" title="Personal Info">
                                    <Form onSubmit={handleProfileUpdate}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Button type="submit" disabled={loading}>Update Info</Button>
                                    </Form>
                                </Tab>

                                <Tab eventKey="addresses" title="Addresses">
                                    <Button variant="outline-primary" className="mb-3" onClick={() => setShowAddressModal(true)}>
                                        <i className="fas fa-plus"></i> Add New Address
                                    </Button>
                                    <ListGroup>
                                        {addresses.map((addr) => (
                                            <ListGroup.Item key={addr._id} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{addr.street}</strong><br />
                                                    {addr.city}, {addr.country} {addr.zipCode}
                                                </div>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr._id)}>
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                        {addresses.length === 0 && <p className="text-muted text-center py-3">No addresses found</p>}
                                    </ListGroup>

                                    {/* Add Address Modal */}
                                    <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Add New Address</Modal.Title>
                                        </Modal.Header>
                                        <Form onSubmit={handleAddAddress}>
                                            <Modal.Body>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Street</Form.Label>
                                                    <Form.Control
                                                        required
                                                        value={newAddress.street}
                                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>City</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={newAddress.city}
                                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Zip Code</Form.Label>
                                                            <Form.Control
                                                                required
                                                                value={newAddress.zipCode}
                                                                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Country</Form.Label>
                                                    <Form.Control
                                                        required
                                                        value={newAddress.country}
                                                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                                    />
                                                </Form.Group>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Cancel</Button>
                                                <Button type="submit" variant="primary" disabled={loading}>Save Address</Button>
                                            </Modal.Footer>
                                        </Form>
                                    </Modal>
                                </Tab>

                                <Tab eventKey="security" title="Security">
                                    <Form onSubmit={handlePasswordChange}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Current Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                minLength={6}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="warning" disabled={loading}>Change Password</Button>
                                    </Form>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
