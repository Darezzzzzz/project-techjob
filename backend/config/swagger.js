const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CSI401 Job Management API',
      version: '1.0.0',
      description: 'API สำหรับระบบจัดการงานช่าง - รวม Authentication และ Job Management',
      contact: {
        name: "CSI401 Student"
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'การลงทะเบียนและเข้าสู่ระบบ'
      },
      {
        name: 'Jobs',
        description: 'การจัดการงานช่าง'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f8a1234567890abcd12345' },
            username: { type: 'string', example: 'suriya_tech01' },
            email: { type: 'string', example: 'suriya@company.com' },
            firstName: { type: 'string', example: 'สุริยะ' },
            lastName: { type: 'string', example: 'ใจดี' },
            role: { type: 'string', example: 'technician' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'สำเร็จ' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'เกิดข้อผิดพลาด' }
          }
        }
      }
    }
  },
  apis: ['./routes/auth_offline.js', './routes/jobs.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;