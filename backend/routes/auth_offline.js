const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();

// In-memory storage for demo (จัดเก็บข้อมูลใน memory สำหรับทดสอบ)
let users = [];
let userCounter = 1;

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "suriya_tech01"
 *               email:
 *                 type: string
 *                 example: "suriya@company.com" 
 *               password:
 *                 type: string
 *                 example: "password123"
 *               firstName:
 *                 type: string
 *                 example: "สุริยะ"
 *               lastName:
 *                 type: string
 *                 example: "ใจดี"
 *               role:
 *                 type: string
 *                 enum: [admin, supervisor, technician]
 *                 example: "technician"
 *               phoneNumber:
 *                 type: string
 *                 example: "081-234-5678"
 *               specialization:
 *                 type: string
 *                 example: "ระบบไฟฟ้า"
 *               experience:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Register Route
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['admin', 'supervisor', 'technician'])
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, role, phoneNumber, specialization, experience } = req.body;

    console.log('📝 REGISTER REQUEST:', { username, email, role });

    // Check if user exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      id: `user_${userCounter++}`,
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'technician',
      phoneNumber: phoneNumber || '',
      specialization: specialization || '',
      experience: experience || 0,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    // Return success response (without password)
    const userResponse = { ...newUser };
    delete userResponse.password;

    console.log('✅ USER CREATED:', userResponse);

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        user: userResponse,
        token,
        tokenExpires: '7d'
      }
    });

  } catch (error) {
    console.error('🚨 REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: ชื่อผู้ใช้หรืออีเมล
 *                 example: "suriya_tech01"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Login Route
router.post('/login', [
  body('identifier').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const { identifier, password } = req.body;

    console.log('🔐 LOGIN REQUEST:', { identifier });

    // Find user by username or email
    const user = users.find(u => u.username === identifier || u.email === identifier);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return success response (without password)
    const userResponse = { ...user };
    delete userResponse.password;

    console.log('✅ LOGIN SUCCESS:', userResponse);

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: userResponse,
        token,
        tokenExpires: '7d'
      }
    });

  } catch (error) {
    console.error('🚨 LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});



module.exports = router;