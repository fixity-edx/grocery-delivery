# 🛒 GroceryHub - Hyperlocal Grocery Delivery Platform

A complete **MERN Stack** hyperlocal grocery delivery platform with **AI integration**, **JWT authentication**, and modern **Tailwind CSS** design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [AI Features](#-ai-features)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (User, Vendor, Delivery Partner, Admin)
- **Admin login from environment variables (NO signup)**
- Secure password hashing with bcrypt
- Rate limiting and request validation

### 👤 User Features
- User registration and login
- Browse nearby stores
- Search and filter products
- Add to cart and wishlist
- Place orders with multiple payment options
- Real-time order tracking
- Order history
- Address management
- Wallet integration
- **AI-powered product recommendations**
- **AI budget optimization tips**
- **AI shopping suggestions**

### 🏪 Vendor/Store Owner Features
- Vendor registration and login
- Multi-store management
- Product inventory management
- Stock alerts and low stock tracking
- Order management
- Delivery partner assignment
- Promotion creation
- Analytics dashboard
- **AI-generated product descriptions**
- **AI promotion suggestions**
- **AI demand forecasting**
- **AI pricing optimization**
- **AI store performance analysis**

### 🚚 Delivery Partner Features
- Delivery partner registration and login
- Order assignment
- Route optimization
- Delivery status updates
- Earnings dashboard
- Performance analytics

### 🛡️ Admin Features
- **Secure environment-based admin login**
- Global system dashboard
- User/vendor/delivery management
- Store approval system
- Platform analytics
- Commission management
- Global promotions control
- **AI fraud detection**
- **AI sales trend analysis**
- System health monitoring

### 🤖 AI Integration (Grok AI)
- Product description generation
- Promotion suggestions
- Demand forecasting
- Dynamic pricing insights
- Personalized recommendations
- Budget optimization
- Fraud detection
- Sales trend analysis
- Store performance analytics

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Axios** - HTTP client for AI API
- **Express Validator** - Input validation
- **Express Rate Limit** - API rate limiting

### Frontend
- **React** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **Context API** - State management

### AI
- **Grok AI** (llama-3.1-8b-instant)
- OpenAI-compatible API endpoint

---

## 📁 Project Structure

\`\`\`
Grocery-delivery/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── storeController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── userController.js
│   │   ├── aiController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & role-based auth
│   │   └── validationMiddleware.js
│   ├── models/                   # Mongoose models
│   │   ├── User.js
│   │   ├── Store.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Promotion.js
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── aiRoutes.js
│   │   └── ...
│   ├── services/
│   │   └── aiService.js          # Grok AI integration
│   └── server.js                 # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Navbar.js
│   │   │       └── Footer.js
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   └── AdminLogin.js
│   │   │   ├── User/
│   │   │   ├── Vendor/
│   │   │   ├── Delivery/
│   │   │   └── Admin/
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
\`\`\`

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Grok API key

### Steps

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd Grocery-delivery
\`\`\`

2. **Install backend dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Install frontend dependencies**
\`\`\`bash
cd frontend
npm install
cd ..
\`\`\`

---

## ⚙️ Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://doopbuddy_db_user:gJ1q8jVVDY9wszfB@cluster0.i64nv6q.mongodb.net/grocery-delivery

# JWT Configuration
JWT_SECRET=e0a17da14d23d26e6b23971ee8c62d059edcb6d5dc9a0350ae324374d732f5ad

# Admin Credentials (Protected - No Signup)
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123

# Grok AI Configuration
GROK_API_KEY=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
GROK_MODEL=llama-3.1-8b-instant
GROK_ENDPOINT=https://api.groq.com/openai/v1/chat/completions

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
\`\`\`

Create \`frontend/.env\`:

\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

---

## 🏃 Running the Application

### Development Mode

**Option 1: Run both frontend and backend together**
\`\`\`bash
npm run dev
\`\`\`

**Option 2: Run separately**

Backend:
\`\`\`bash
npm run server
\`\`\`

Frontend:
\`\`\`bash
npm run client
\`\`\`

### Production Mode

Build frontend:
\`\`\`bash
npm run build
\`\`\`

Start server:
\`\`\`bash
npm start
\`\`\`

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register user/vendor/delivery | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/admin-login` | Admin login (env-based) | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | Vendor |
| PUT | `/api/products/:id` | Update product | Vendor |
| DELETE | `/api/products/:id` | Delete product | Vendor |
| POST | `/api/products/ai-description` | Generate AI description | Vendor |

### Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create order | User |
| GET | `/api/orders/my-orders` | Get user orders | User |
| GET | `/api/orders/:id` | Get order details | Private |
| PUT | `/api/orders/:id/status` | Update order status | Vendor/Delivery |
| PUT | `/api/orders/:id/cancel` | Cancel order | User |

### AI Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/ai/product-description` | Generate product description | Vendor |
| POST | `/api/ai/promotion-suggestions` | Get promotion suggestions | Vendor |
| POST | `/api/ai/forecast-demand` | Forecast product demand | Vendor |
| GET | `/api/ai/recommendations` | Get personalized recommendations | User |
| GET | `/api/ai/budget-tips` | Get budget optimization tips | User |
| POST | `/api/ai/fraud-detection` | Analyze fraud signals | Admin |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/toggle-status` | Toggle user status | Admin |
| GET | `/api/admin/stores/pending` | Get pending store approvals | Admin |
| PUT | `/api/admin/stores/:id/approve` | Approve/reject store | Admin |

---

## 👥 User Roles

### 1. **User (Customer)**
- Browse and search products
- Add to cart and wishlist
- Place orders
- Track deliveries
- Access AI recommendations

### 2. **Vendor (Store Owner)**
- Manage stores and products
- Handle orders
- Create promotions
- View analytics
- Use AI tools for business insights

### 3. **Delivery Partner**
- View assigned deliveries
- Update delivery status
- Track earnings
- View performance metrics

### 4. **Admin**
- **Login**: Environment-based (NO signup)
- **Credentials**: Stored in .env file
- Manage all users and stores
- Approve vendor stores
- Monitor platform analytics
- Access AI fraud detection

---

## 🤖 AI Features

### For Users
- **Personalized Recommendations**: AI suggests products based on purchase history
- **Budget Optimization**: Get tips to save money on groceries
- **Smart Shopping**: AI-generated shopping lists

### For Vendors
- **Product Descriptions**: Auto-generate compelling product descriptions
- **Promotion Suggestions**: AI recommends effective promotional campaigns
- **Demand Forecasting**: Predict future demand for inventory planning
- **Pricing Optimization**: Get optimal pricing recommendations
- **Store Performance**: Detailed AI analysis of store metrics

### For Admin
- **Fraud Detection**: AI analyzes orders for suspicious patterns
- **Sales Trends**: Advanced analytics and trend predictions
- **Platform Insights**: Comprehensive business intelligence

---

## 🔑 Default Credentials

### Admin Login
- **Email**: admin@gmail.com
- **Password**: admin123
- **Note**: Admin cannot register. Credentials are in .env file.

### Test Users
Create your own users through the registration page for User, Vendor, or Delivery Partner roles.

---

## 🎨 Design Features

- **Modern UI**: Clean, professional design with Tailwind CSS
- **Responsive**: Works on all devices
- **Animations**: Smooth transitions and micro-interactions
- **Gradient Backgrounds**: Eye-catching color schemes
- **Card-based Layout**: Organized content presentation
- **Dark Mode Ready**: Easy to implement

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure admin authentication
- Protected routes
- CORS configuration

---

## 📊 Database Models

- **User**: Authentication, profile, addresses, wallet, wishlist
- **Store**: Vendor stores with location and ratings
- **Product**: Inventory with pricing and stock management
- **Order**: Complete order lifecycle tracking
- **Cart**: User shopping cart
- **Promotion**: Discount codes and campaigns

---

## 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Map integration for delivery tracking
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Push notifications

---

## ✅ API Test Results

The following API endpoints have been rigorously tested and verified as of the latest build.

### 🔐 Authentication
- [x] **POST** `/api/auth/register` (Vendor) - ✅ Passed
- [x] **POST** `/api/auth/login` (Vendor) - ✅ Passed
- [x] **POST** `/api/auth/register` (User) - ✅ Passed
- [x] **POST** `/api/auth/login` (User) - ✅ Passed
- [x] **POST** `/api/auth/register` (Delivery) - ✅ Passed
- [x] **POST** `/api/auth/login` (Delivery) - ✅ Passed

### 🏪 Stores
- [x] **POST** `/api/stores` - ✅ Passed

### 📦 Products
- [x] **POST** `/api/products` - ✅ Passed

### 🛒 Cart
- [x] **POST** `/api/cart/add` - ✅ Passed
- [x] **GET** `/api/cart` - ✅ Passed

### 👤 User
- [x] **POST** `/api/users/addresses` - ✅ Passed

### 🛍️ Orders
- [x] **POST** `/api/orders` - ✅ Passed
- [x] **GET** `/api/orders/my-orders` - ✅ Passed
- [x] **GET** `/api/orders/vendor/:storeId` - ✅ Passed
- [x] **PUT** `/api/orders/:id/assign-delivery` - ✅ Passed

### 🚚 Delivery
- [x] **GET** `/api/orders/delivery/my-deliveries` - ✅ Passed

All core functionalities including multi-role authentication, store management, shopping cart operations, and the complete order lifecycle (creation to delivery assignment) are fully operational.

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ using MERN Stack + AI

---

## 🙏 Acknowledgments

- Grok AI for intelligent features
- MongoDB Atlas for cloud database
- Tailwind CSS for beautiful styling
- React community for amazing tools

---

**Happy Coding! 🚀**
