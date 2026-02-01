# Final Project Report
**Course:** Advanced Databases (NoSQL)
**Project:** Laptop Store E-Commerce Application

## 1. Project Overview
This project is a full-stack e-commerce web application designed for selling laptops. It demonstrates the use of a NoSQL database (MongoDB) to handle complex product specifications, user sessions, and high-volume order processing. The system features a responsive React frontend and a robust Node.js/Express backend.

**Key Features:**
*   **User Roles:** Customer (Browse, Buy, Review) and Admin (Manage Products, Users, Orders, Analytics).
*   **Dynamic Catalog:** Advanced filtering (Brand, Price, Specs) and Search.
*   **Transactions:** ACID-compliant order placement ensuring stock consistency.
*   **Analytics:** Real-time dashboards using MongoDB Aggregation Framework.

## 2. System Architecture
The application follows the **MVC (Model-View-Controller)** architectural pattern with a split Client-Server structure.

*   **Frontend (Client):**
    *   **Framework:** React 18
    *   **State Management:** Context API (`AuthContext`, `CartContext`)
    *   **UI Library:** React Bootstrap & SCSS
    *   **Communication:** Axios (REST API consumer)

*   **Backend (Server):**
    *   **Runtime:** Node.js
    *   **Framework:** Express.js
    *   **Security:** Helmet, CORS, Rate-Limiting, JWT, Bcrypt
    *   **Documentation:** Swagger UI

*   **Database:**
    *   **DBMS:** MongoDB (Atlas/Local)
    *   **ODM:** Mongoose

**Data Flow:**
1.  User initiates action (e.g., "Buy Laptop") on Frontend.
2.  Axios sends `POST /api/orders` request with JWT token.
3.  Express Middleware validates Token and Request Body.
4.  `orderController` starts a Mongoose Transaction.
5.  Database updates: Decrement Stock (Laptop) -> Create Order.
6.  Response sent back to Client.

## 3. Database Schema Description
The data model leverages MongoDB's flexible schema to store complex structures efficiently.

### 3.1 Collections & Relationships
*   **Users**: Stores purchase history (embedded references) and profiles.
*   **Laptops**: Core product data. Features embedded `specifications` object for easy filtering.
*   **Orders**: Heavy use of embedding. Stores a snapshot of the product at the time of purchase (`items` array) to preserve history even if the product changes later.
*   **Reviews**: References both `User` and `Laptop`.
*   **Categories**: Hierarchical organization.

### 3.2 Key Models
**Laptop Model (Excerpt):**
```javascript
{
  brand: String,
  model: String,
  price: Number,
  stock: Number,
  specifications: {
    processor: String,
    ram: String,
    storage: String
  },
  ratings: {
    average: Number,
    count: Number
  }
}
```

## 4. MongoDB Queries & Aggregations
The project utilizes advanced queries beyond simple CRUD.

### 4.1 Advanced Filtering
We use dynamic query building for the catalog:
```javascript
// Example: Filter by Brand and Price Range
const filter = {
  brand: { $in: ['Apple', 'Dell'] },
  price: { $gte: 1000, $lte: 2000 },
  'specifications.ram': { $regex: '16GB', $options: 'i' }
};
```

### 4.2 Aggregation Pipelines
**Sales Analytics (`getSalesAnalytics`):**
1.  **$match**: Filter valid orders (shipped/delivered) within a date range.
2.  **$group**: Group by date formatted using `$dateToString`.
3.  **$project**: Calculate Total Sales, Order Count, and Average Order Value.

**Top Selling Products:**
1.  **$unwind**: Deconstruct order items.
2.  **$group**: Sum quantity by `laptopId`.
3.  **$sort**: Descending order.
4.  **$lookup**: Join with `laptops` collection to fetch product details.

## 5. API Documentation
The API is fully documented using **Swagger/OpenAPI 3.0**.
*   **Access**: `http://localhost:5000/api-docs`
*   **Format**: JSON/HTML

**Core Endpoints:**
*   `GET /api/laptops`: List products (pagination, sort, filter).
*   `POST /api/orders`: Place an order (Protected).
*   `GET /api/analytics/dashboard`: Admin stats.
*   `PATCH /api/laptops/:id/stock`: Atomic stock update.

## 6. Indexing & Optimization Strategy
To ensure performance at scale, we implemented a strategic indexing plan.

1.  **Compound Indexes**:
    *   `Laptop`: `{ brand: 1, model: 1 }` (For frequent search/sort).
    *   `Order`: `{ userId: 1, createdAt: -1 }` (For "My Orders" page).
2.  **Text Indexes**:
    *   Searching descriptions and models efficiently.
    *   `{ description: 'text', model: 'text' }`
3.  **Unique Indexes**:
    *   `User.email`, `User.username`, `Category.slug`.
4.  **Sparse Indexes**:
    *   Used for optional unique fields like `phone`.

## 7. Contribution
*   **Student 1 Name**: Backend Architecture, API Design, Authentication, Database Seeding.
*   **Student 2 Name**: Frontend Development, React Components, API Integration, Styling.

---
**GitHub Repository**: [Link to Repo]
