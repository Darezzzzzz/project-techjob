const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

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
 *     summary: สมัครสมาชิก
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
 *             properties:
 *               username:
 *                 type: string
 *                 example: "test_user"
 *               email:
 *                 type: string
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               firstName:
 *                 type: string
 *                 example: "ทดสอบ"
 *               lastName:
 *                 type: string
 *                 example: "ระบบ"
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 */
// POST /api/auth/register - สมัครสมาชิก
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username ต้อง 3-20 ตัวอักษร'),
  body('email').isEmail().withMessage('กรอก email ให้ถูกต้อง'),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
  body('firstName').trim().notEmpty().withMessage('ต้องกรอกชื่อจริง'),
  body('lastName').trim().notEmpty().withMessage('ต้องกรอกนามสกุล'),
], async (req, res) => {
  try {
    console.log('\n📝 REGISTER REQUEST:');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: '❌ ข้อมูลไม่ถูกต้อง',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      });
    }

    const { username, email, password, firstName, lastName, role = 'technician', specialization = 'general' } = req.body;

    // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.username || existingUser.email);
      return res.status(400).json({
        success: false,
        message: '❌ มีผู้ใช้นี้อยู่แล้ว',
        details: existingUser.email === email ? 'Email ซ้ำ' : 'Username ซ้ำ'
      });
    }

    // สร้างผู้ใช้ใหม่
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      specialization
    });

    await user.save();

    // สร้าง JWT Token
    const token = generateToken(user._id);

    console.log('✅ User registered successfully:', user.username);
    
    res.status(201).json({
      success: true,
      message: '✅ สมัครสมาชิกสำเร็จ',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('\n🚨 REGISTER ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      message: '🚨 เกิดข้อผิดพลาดในระบบ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
 *                 description: Email หรือ Username
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: ข้อมูลไม่ถูกต้อง
 */
// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', [
  body('identifier').trim().notEmpty().withMessage('ต้องกรอก username หรือ email'),
  body('password').notEmpty().withMessage('ต้องกรอกรหัสผ่าน')
], async (req, res) => {
  try {
    console.log('\n🔐 LOGIN REQUEST:');
    console.log('Identifier:', req.body.identifier);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: '❌ ข้อมูลไม่ถูกต้อง',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { identifier, password } = req.body;

    // หาผู้ใช้จาก email หรือ username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).select('+password');

    if (!user) {
      console.log('❌ User not found for identifier:', identifier);
      return res.status(401).json({
        success: false,
        message: '❌ ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    console.log('👤 User found:', user.username, '(' + user.email + ')');

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.username);
      return res.status(401).json({
        success: false,
        message: '❌ ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    console.log('✅ Password valid for user:', user.username);

    // สร้าง JWT Token
    const token = generateToken(user._id);

    // อัปเดต last login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful for user:', user.username);
    
    res.json({
      success: true,
      message: '✅ เข้าสู่ระบบสำเร็จ',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('\n🚨 LOGIN ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request identifier:', req.body.identifier);
    
    res.status(500).json({
      success: false,
      message: '🚨 เกิดข้อผิดพลาดในระบบ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;