# Job Management System - Backend API

## 🚀 JWT Authentication System

This backend provides a complete JWT-based authentication system for the Job Management System with role-based access control.

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techjob
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Run Server
```bash
# Development
npm run dev

# Production
npm start
```

## 👤 User Roles

- **Admin**: Full access to all features
- **Supervisor**: Can manage technicians and view reports
- **Technician**: Can view assigned jobs and update status

## 🔐 API Endpoints

### Authentication Routes `/api/auth`

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "technician",
  "phoneNumber": "0812345678",
  "specialization": "electrical",
  "experience": 5
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john_doe", // username or email
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f7a1b2c3d4e5f6a7b8c9d0",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "technician",
      "technicianId": "TECH0001",
      "specialization": "electrical"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpires": "7d"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "0812345679"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Technicians Routes `/api/technicians`

#### Get All Technicians (Admin/Supervisor only)
```http
GET /api/technicians?page=1&limit=10&search=john&specialization=electrical
Authorization: Bearer <token>
```

#### Get Technician by ID
```http
GET /api/technicians/:id
Authorization: Bearer <token>
```

#### Create Technician (Admin only)
```http
POST /api/technicians
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "jane_smith",
  "email": "jane@example.com",
  "password": "Password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "plumbing",
  "experience": 3,
  "phoneNumber": "0887654321"
}
```

#### Update Technician
```http
PUT /api/technicians/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Johnson",
  "specialization": "hvac"
}
```

#### Delete Technician (Admin only)
```http
DELETE /api/technicians/:id
Authorization: Bearer <token>
```

## 🔒 Authentication Usage

### Frontend Integration

#### Store Token
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

#### Add to Requests
```javascript
// Axios interceptor
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Or for individual requests
const config = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};
axios.get('/api/auth/profile', config);
```

#### React Context Example
```javascript
// AuthContext.js
import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false
  });

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/api/auth/login', credentials);
      
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return response.data;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🛡️ Security Features

- **Password Hashing**: Using bcryptjs with salt rounds 12
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Express-validator for request validation
- **Role-based Access Control**: Middleware for authorization
- **CORS Protection**: Configurable CORS settings
- **Error Handling**: Comprehensive error responses

## 🔧 Middleware

### Authentication Middleware
```javascript
const { authenticateToken } = require('./middleware/auth');

// Protect routes
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

### Authorization Middleware
```javascript
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

// Admin only route
app.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Multiple roles
app.get('/management', authenticateToken, authorizeRoles('admin', 'supervisor'), (req, res) => {
  res.json({ message: 'Management access granted' });
});
```

## 📚 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized / Invalid Token
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing with Postman

Import the following environment variables:
- `base_url`: `http://localhost:5000`
- `token`: `{{token}}` (set after login)

Example collection structure:
```
Job Management API/
├── Auth/
│   ├── Register
│   ├── Login
│   ├── Get Profile
│   └── Update Profile
└── Technicians/
    ├── Get All Technicians
    ├── Get Technician
    ├── Create Technician
    ├── Update Technician
    └── Delete Technician
```

## 📱 Next Steps

1. **Add Job Management Routes**: Create, update, assign jobs
2. **File Upload**: Profile images and job attachments
3. **Real-time Updates**: WebSocket for live notifications
4. **Email Services**: Password reset, notifications
5. **Logging**: Request logging and error tracking
6. **Rate Limiting**: Prevent spam and abuse
7. **API Documentation**: Swagger/OpenAPI docs

## 🤝 Contributing

1. Follow REST API best practices
2. Add proper validation and error handling
3. Include unit tests for new features
4. Update documentation for API changes