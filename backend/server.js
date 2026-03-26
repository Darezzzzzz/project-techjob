const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Pretty print JSON in development
if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2);
}

// Swagger Documentation - สำหรับการสอบ
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "CSI401 Job Management API",
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Routes - ใช้เวอร์ชัน offline สำหรับทดสอบ
app.use('/api/auth', require('./routes/auth_offline'));
app.use('/api/jobs', require('./routes/jobs'));

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: '🔧 Job Management API สำหรับการสอบ CSI401',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getAllJobs: 'GET /api/jobs',
      createJob: 'POST /api/jobs'
    },
    documentation: '/api-docs',
    status: 'Server กำลังทำงานปกติ ✅'
  });
});

// Global Error Handler - จัดการ error ทั้งหมด
app.use((error, req, res, next) => {
  console.error('\n🚨 ERROR DETECTED:');
  console.error('Time:', new Date().toLocaleString('th-TH'));
  console.error('URL:', req.method, req.originalUrl);
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('Body:', req.body);
  console.error('─'.repeat(50));

  res.status(500).json({
    success: false,
    message: '🚨 เกิดข้อผิดพลาดในระบบ',
    error: process.env.NODE_ENV === 'development' ? {
      message: error.message,
      stack: error.stack
    } : 'กรุณาติดต่อผู้ดูแลระบบ',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - จัดการ route ที่ไม่มี
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '❌ ไม่พบ API endpoint นี้',
    availableEndpoints: [
      'GET /',
      'GET /api-docs', 
      'POST /api/auth/register',
      'POST /api/auth/login'
    ],
    requested: req.method + ' ' + req.originalUrl
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techjob');
    console.log('\n🎯 MongoDB Atlas connected successfully!');
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Please check your .env file and internet connection');
    // Don't exit in development to allow for manual MongoDB startup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Server will continue without database connection');
    }
  }
};

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n🚀 Server running on port', PORT);
    console.log('📚 API Documentation:', `http://localhost:${PORT}/api-docs`);
    console.log('🏠 Home:', `http://localhost:${PORT}`);
    console.log('\n✅ API Endpoints ready for testing:');
    console.log('   📝 Register: POST /api/auth/register');
    console.log('   🔐 Login: POST /api/auth/login');
    console.log('\n' + '='.repeat(50));
  });
});

module.exports = app;