import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
        items.push(
            <BSPagination.Item
                key={number}
                active={number === currentPage}
                onClick={() => onPageChange(number)}
            >
                {number}
            </BSPagination.Item>,
        );
    }

    return (
        <BSPagination className="justify-content-center">
            <BSPagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
            <BSPagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
            {items}
            <BSPagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <BSPagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
        </BSPagination>
    );
};

export default Pagination;
