const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 🔐 Authentication
 *   description: ระบบจัดการการลงทะเบียนและเข้าสู่ระบบ (User Authentication & Registration)
 */

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
 *     summary: 📝 Register - สมัครสมาชิกใหม่
 *     description: ลงทะเบียนผู้ใช้งานใหม่ในระบบ (Admin, Supervisor, หรือ Technician)
 *     tags: [🔐 Authentication]
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
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: ชื่อผู้ใช้ (ตัวอักษร ตัวเลข และ _ เท่านั้น)
 *                 example: "suriya_tech01"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: อีเมลผู้ใช้งาน
 *                 example: "suriya@company.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: รหัสผ่าน (ต้องมีตัวใหญ่ ตัวเล็ก และตัวเลข)
 *                 example: "Password123"
 *               firstName:
 *                 type: string
 *                 description: ชื่อจริง
 *                 example: "สุริยะ"
 *               lastName:
 *                 type: string
 *                 description: นามสกุล
 *                 example: "ใจดี"
 *               role:
 *                 type: string
 *                 enum: [admin, supervisor, technician]
 *                 default: technician
 *                 description: บทบาทในระบบ
 *                 example: "technician"
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: หมายเลขโทรศัพท์ (10 หลัก)
 *                 example: "0812345678"
 *               specialization:
 *                 type: string
 *                 description: ความเชี่ยวชาญ (สำหรับ technician)
 *                 example: "electrical"
 *               experience:
 *                 type: integer
 *                 description: ประสบการณ์ (ปี) สำหรับ technician
 *                 example: 3
 *           examples:
 *             technician:
 *               summary: สมัครสมาชิก Technician
 *               value:
 *                 username: "suriya_tech01"
 *                 email: "suriya@company.com"
 *                 password: "Password123"
 *                 firstName: "สุริยะ"
 *                 lastName: "ใจดี"
 *                 role: "technician"
 *                 phoneNumber: "0812345678"
 *                 specialization: "electrical"
 *                 experience: 3
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     tokenExpires:
 *                       type: string
 *                       example: "7d"
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือ email/username ซ้ำ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'supervisor', 'technician'])
    .withMessage('Role must be admin, supervisor, or technician'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role = 'technician',
      phoneNumber,
      specialization,
      experience
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create user data
    let userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber
    };

    // Add technician-specific fields
    if (role === 'technician') {
      if (specialization) userData.specialization = specialization;
      if (experience) userData.experience = experience;
      
      // Generate technician ID
      const techCount = await User.countDocuments({ role: 'technician' });
      userData.technicianId = `TECH${String(techCount + 1).padStart(4, '0')}`;
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          technicianId: user.technicianId,
          specialization: user.specialization,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        token,
        tokenExpires: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 🔑 Login - เข้าสู่ระบบ
 *     description: เข้าสู่ระบบด้วย username/email และรหัสผ่าน
 *     tags: [🔐 Authentication]
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
 *                 description: อีเมลหรือ username สำหรับเข้าสู่ระบบ
 *                 example: "suriya@company.com"
 *               password:
 *                 type: string
 *                 description: รหัสผ่าน
 *                 example: "Password123"
 *           examples:
 *             email_login:
 *               summary: Login ด้วย Email
 *               value:
 *                 identifier: "suriya@company.com"
 *                 password: "Password123"
 *             username_login:
 *               summary: Login ด้วย Username
 *               value:
 *                 identifier: "suriya_tech01"
 *                 password: "Password123"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT Token สำหรับการยืนยันตัวตน
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     tokenExpires:
 *                       type: string
 *                       example: "7d"
 *       401:
 *         description: ข้อมูลเข้าสู่ระบบไม่ถูกต้องหรือบัญชีถูกปิด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalid_credentials:
 *                       value: "Invalid credentials"
 *                     account_deactivated:
 *                       value: "Account has been deactivated"
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }).select('+password'); // Include password field

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          technicianId: user.technicianId,
          specialization: user.specialization,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        },
        token,
        tokenExpires: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 👤 Get Profile - ดูข้อมูลส่วนตัว
 *     description: ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่เข้าสู่ระบบอยู่
 *     tags: [🔐 Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลโปรไฟล์สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          technicianId: user.technicianId,
          specialization: user.specialization,
          experience: user.experience,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: ✏️ Update Profile - แก้ไขข้อมูลส่วนตัว
 *     description: อัปเดตข้อมูลโปรไฟล์ของผู้ใช้งาน (เฉพาะข้อมูลที่อนุญาต)
 *     tags: [🔐 Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 description: ชื่อจริง
 *                 example: "สุริยะ"
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 description: นามสกุล
 *                 example: "ใจดี"
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: หมายเลขโทรศัพท์ (10 หลัก)
 *                 example: "0812345678"
 *               specialization:
 *                 type: string
 *                 description: ความเชี่ยวชาญ (เฉพาะ technician)
 *                 example: "electrical"
 *               experience:
 *                 type: integer
 *                 description: ประสบการณ์ (ปี) เฉพาะ technician
 *                 example: 5
 *           examples:
 *             general_update:
 *               summary: อัปเดตข้อมูลทั่วไป
 *               value:
 *                 firstName: "สุริยะ"
 *                 lastName: "ใจดี"
 *                 phoneNumber: "0898765432"
 *             technician_update:
 *               summary: อัปเดตข้อมูล technician
 *               value:
 *                 firstName: "สุริยะ"
 *                 lastName: "ใจดี"
 *                 phoneNumber: "0898765432"
 *                 specialization: "hvac"
 *                 experience: 5
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือไม่มีข้อมูลให้อัปเดต
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber'];
    
    if (req.user.role === 'technician') {
      allowedUpdates.push('specialization', 'experience');
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 🚺 Logout - ออกจากระบบ
 *     description: ออกจากระบบ (ผู้ใช้ต้องลบ token ในฝั่ง client)
 *     tags: [🔐 Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful. Please remove the token from client storage."
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

module.exports = router;