# Laptop Store - Final Project (NoSQL)

## Project Overview
A full-stack web application for an online Laptop Store, demonstrating advanced NoSQL database modeling, complex MongoDB aggregations, and a robust REST API backend with a React frontend.

## Features
- **User Management**: Authentication (JWT), Profile Management, Role-based Access (Admin/User).
- **Product Catalog**: Advanced filtering, search, and categorization of laptops.
- **Shopping Cart & Orders**: Session-based cart, secure checkout, order history, and tracking.
- **Reviews & Ratings**: User-generated reviews affecting product ratings.
- **Admin Dashboard**: Manage products, users, categories, and view real-time **Analytics**.
- **Analytics**: Aggregation pipelines for Sales Reports, Top Selling Products, and Revenue Stats.

## Tech Stack
- **Frontend**: React, React Bootstrap, Context API
- **Backend**: Node.js, Express
- **Database**: MongoDB (Atlas)
- **Documentation**: Swagger API

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas Connection String

### Backend Setup (Terminal 1)
1. Navigate to `backend/`: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` file (see provided template).
4. Run database seed (Optional, resets data): `npm run seed` or `node fix-db.js`
5. Start server: `npm start` (Runs on port 5000)

### Frontend Setup (Terminal 2)
1. Open a new terminal.
2. Navigate to `frontend/`: `cd frontend`
3. Install dependencies: `npm install`
4. Start application: `npm start` (Runs on port 3000)

## Test Accounts (Pre-configured)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Customer** | `customer@example.com` | `customer123` |

## API Documentation
The API is fully documented using Swagger.
Access the docs at: `http://localhost:5000/api-docs`

## Database Schema
- **Users**: Stores user info, roles.
- **Laptops**: Product details, specs, stock.
- **Orders**: Embedded items, shipping/payment info.
- **Reviews**: Linked to Laptop and User.
- **Categories**: Hierarchical categories.

## Rubric Compliance Checklist
## Rubric Compliance Checklist

### A. MongoDB Implementation (50 Points)
- [x] **CRUD Operations (8pts)**: Full Create, Read, Update, Delete for Laptops, Users, Orders, Reviews, and Categories.
- [x] **Data Modeling (8pts)**: 
    - **Embedded**: `Order` embeds `items` and `shippingAddress`. `Laptop` embeds `specifications` and `features`.
    - **Referenced**: `Order` references `User`. `Review` references `User` and `Laptop`. `Laptop` references `Category`.
- [x] **Advanced Update/Delete (8pts)**: 
    - **$inc**: Atomic stock deduction in `orderController.js`.
    - **$push**: Adding images to reviews.
    - **$set**: Updating profile fields via PATCH.
    - **Soft Delete**: `deleteLaptop` sets `isActive: false` instead of removing document.
- [x] **Aggregation Framework (10pts)**: 
    - **Sales Analytics**: `$group` by date (`$dateToString`), `$match` by status, `$sum` totals.
    - **Top Products**: `$group` order items, `$lookup` product details, `$sort` by quantity.
    - **Price Stats**: `$bucket` for price range distribution.
- [x] **Indexes & Optimization (6pts)**: 
    - **Compound Indexes**: `laptopSchema.index({ brand: 1, model: 1 })`.
    - **Text Search**: `$regex` search optimized with indexes.
    - **Unique Indexes**: `email`, `username`, `slug`.

### B. Backend Logic & REST API (30 Points)
- [x] **REST API Design (6pts)**: 
    - **25+ Endpoints**: Exceeds minimum of 12.
    - **Resource Oriented**: `/api/laptops`, `/api/users`, etc.
    - **HTTP Methods**: Proper use of GET, POST, PUT, DELETE, PATCH.
- [x] **Business Logic (6pts)**: 
    - **Transactions**: ACID compliance for Order creation (stock -1, order +1) using Mongoose Sessions.
    - **Validation**: Stock availability check before order placement.
- [x] **Security (4pts)**: 
    - **Auth**: JWT (JSON Web Tokens) for stateless authentication.
    - **Hashing**: `bcryptjs` for secure password storage.
    - **Protection**: `helmet` for headers, `cors` for cross-origin, `express-rate-limit` for DDoS protection.
- [x] **Code Quality (4pts)**: Modular structure (Controllers, Routes, Models, Services, Utils).

### C. Frontend (10 Points)
- [x] **Functional Pages (10pts)**: 12+ Pages implemented (Home, Cart, Checkout, Profile, Login, Register, Admin Dashboard, etc.) - Exceeds minimum of 6.
- [x] **API Integration (4pts)**: Real-time data fetching using `axios` and custom hooks (`useFetch`).
- [x] **Usability (2pts)**: Responsive Bootstrap UI, Loading spinners, Error alerts, Toast notifications.

### D. Documentation (10 Points)
- [x] **Database Documentation**: Schemas explained in `backend/src/models`.
- [x] **API Documentation**: Interactive Swagger UI at `http://localhost:5000/api-docs`.
- [x] **Architecture**: MVC Pattern (Model-View-Controller) clearly separated.

### C. Frontend
- [x] **Functional Pages**: 7+ main pages implemented.
- [x] **API Integration**: fully connected via axios services.
- [x] **Usability**: Responsive UI with Bootstrap and loading states.

## Aggregations Implemented
1. **Sales Analytics**: Groups sales by date (Daily/Monthly) for charts.
2. **Top Selling Products**: Aggregates order items to find best sellers.
3. **Revenue Stats**: Calculates total revenue and order counts dynamically.
