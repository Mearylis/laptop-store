import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Laptops from './pages/Laptops';
import LaptopDetail from './pages/LaptopDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import LaptopManagement from './pages/Admin/LaptopManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import Analytics from './pages/Admin/Analytics';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="app">
                        <Navbar />
                        <main className="py-4">
                            <Container>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/laptops" element={<Laptops />} />
                                    <Route path="/laptops/:id" element={<LaptopDetail />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Protected Routes */}
                                    <Route element={<PrivateRoute />}>
                                        <Route path="/checkout" element={<Checkout />} />
                                        <Route path="/orders" element={<Orders />} />
                                        <Route path="/profile" element={<Profile />} />
                                    </Route>

                                    {/* Admin Routes */}
                                    <Route element={<AdminRoute />}>
                                        <Route path="/admin" element={<AdminDashboard />} />
                                        <Route path="/admin/laptops" element={<LaptopManagement />} />
                                        <Route path="/admin/orders" element={<OrderManagement />} />
                                        <Route path="/admin/analytics" element={<Analytics />} />
                                    </Route>
                                </Routes>
                            </Container>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;