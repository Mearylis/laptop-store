import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { laptopService } from '../services/laptopService';
import LaptopCard from '../components/Laptop/LaptopCard';
import LaptopFilter from '../components/Laptop/LaptopFilter';
import Pagination from '../components/Common/Pagination';

const Laptops = () => {
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    ram: '',
    storage: '',
    processor: '',
    search: '',
    sort: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchLaptops();
    fetchCategories();
  }, [filters]);

  const fetchLaptops = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await laptopService.getAllLaptops(params);
      setLaptops(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error.message || (typeof error === 'string' ? error : 'Failed to load laptops');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await laptopService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    const [sort, order] = e.target.value.split('_');
    setFilters(prev => ({ ...prev, sort, order }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLaptops();
  };

  if (loading && laptops.length === 0) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading laptops...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Laptop Catalog</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={3}>
          <LaptopFilter
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
        </Col>

        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <p className="mb-0">
              Showing {laptops.length} of {pagination.totalItems || 0} products
            </p>
            <Form.Select
              style={{ width: '200px' }}
              value={`${filters.sort}_${filters.order}`}
              onChange={handleSortChange}
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="ratings.average_desc">Highest Rated</option>
            </Form.Select>
          </div>

          {laptops.length === 0 ? (
            <Alert variant="info">
              No laptops found. Try adjusting your filters.
            </Alert>
          ) : (
            <>
              <Row>
                {laptops.map(laptop => (
                  <Col key={laptop._id} sm={6} md={4} className="mb-4">
                    <LaptopCard laptop={laptop} />
                  </Col>
                ))}
              </Row>

              {pagination.totalPages > 1 && (
                <div className="mt-5">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Laptops;