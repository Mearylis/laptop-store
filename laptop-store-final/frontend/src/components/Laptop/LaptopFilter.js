import React from 'react';
import { Card, Form, Button, Accordion } from 'react-bootstrap';

const LaptopFilter = ({ filters, categories, onFilterChange, onSearch }) => {
    // Local state for text inputs to prevent immediate parent updates
    const [localFilters, setLocalFilters] = React.useState({
        search: filters.search || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || ''
    });

    // Update local state when props change (e.g., Clear All)
    React.useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            minPrice: filters.minPrice || '',
            maxPrice: filters.maxPrice || ''
        });
    }, [filters.search, filters.minPrice, filters.maxPrice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update local state immediately for UI responsiveness
        if (['search', 'minPrice', 'maxPrice'].includes(name)) {
            setLocalFilters(prev => ({ ...prev, [name]: value }));
        } else {
            // Dropdowns update parent immediately
            onFilterChange({ [name]: value });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Only trigger parent update if value actually changed from props
        if (filters[name] !== value) {
            onFilterChange({ [name]: value });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur(); // Trigger blur to update
        }
    };

    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white border-bottom-0 pt-4">
                <h5 className="mb-0">Refine Search</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={onSearch}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search keywords..."
                            name="search"
                            value={localFilters.search}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                        />
                    </Form.Group>

                    <Accordion defaultActiveKey="0" flush>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Category</Accordion.Header>
                            <Accordion.Body>
                                <Form.Select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleChange}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </Form.Select>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Price Range</Accordion.Header>
                            <Accordion.Body>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="number"
                                        placeholder="Min"
                                        name="minPrice"
                                        value={localFilters.minPrice}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="me-2"
                                    />
                                    <span>-</span>
                                    <Form.Control
                                        type="number"
                                        placeholder="Max"
                                        name="maxPrice"
                                        value={localFilters.maxPrice}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="ms-2"
                                    />
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Brand</Accordion.Header>
                            <Accordion.Body>
                                <Form.Select
                                    name="brand"
                                    value={filters.brand}
                                    onChange={handleChange}
                                >
                                    <option value="">All Brands</option>
                                    {['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI'].map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </Form.Select>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Button variant="primary" type="submit" className="w-100 mt-3">
                        Apply Filters
                    </Button>
                    <Button
                        variant="link"
                        className="w-100 mt-2 text-decoration-none"
                        onClick={() => onFilterChange({
                            search: '', category: '', brand: '', minPrice: '', maxPrice: ''
                        })}
                    >
                        Clear All
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default LaptopFilter;
