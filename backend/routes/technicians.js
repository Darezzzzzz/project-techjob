const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 🔧 Technician Management
 *   description: ระบบจัดการข้อมูลช่างเทคนิค (Technician Management System)
 */

/**
 * @swagger
 * /api/technicians:
 *   get:
 *     summary: 📋 Get All Technicians - ดูรายการช่างเทคนิค
 *     description: ดึงรายการช่างเทคนิคทั้งหมด พร้อมการกรองและแบ่งหน้า (เฉพาะ Admin และ Supervisor)
 *     tags: [🔧 Technician Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: หมายเลขหน้า
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: จำนวนรายการต่อหน้า
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: ค้นหาจากชื่อ, นามสกุล, username หรือ technicianId
 *         example: "สุริยะ"
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *           enum: [electrical, plumbing, hvac, general, other]
 *         description: กรองตามความเชี่ยวชาญ
 *         example: "electrical"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: กรองตามสถานะการใช้งาน
 *         example: true
 *     responses:
 *       200:
 *         description: ดึงรายการช่างเทคนิคสำเร็จ
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
 *                     technicians:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ - ต้องเป็น Admin หรือ Supervisor
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   GET /api/technicians
// @desc    Get all technicians
// @access  Private (Admin, Supervisor)
router.get('/', [
  authenticateToken,
  authorizeRoles('admin', 'supervisor')
], async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialization, isActive } = req.query;
    
    // Build filter object
    const filter = { role: 'technician' };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { technicianId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialization) {
      filter.specialization = specialization;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get technicians with pagination
    const technicians = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        technicians,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting technicians'
    });
  }
});

/**
 * @swagger
 * /api/technicians/{id}:
 *   get:
 *     summary: 👤 Get Technician by ID - ดูข้อมูลช่างเทคนิค
 *     description: ดึงข้อมูลช่างเทคนิครายบุคคล (Admin, Supervisor หรือตัวเองเท่านั้น)
 *     tags: [🔧 Technician Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId ของช่างเทคนิค
 *         example: "64f8a1234567890abcd12345"
 *     responses:
 *       200:
 *         description: ดึงข้อมูลช่างเทคนิคสำเร็จ
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
 *                     technician:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ - ไม่สามารถดูข้อมูลนี้ได้
 *       404:
 *         description: ไม่พบช่างเทคนิค
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   GET /api/technicians/:id
// @desc    Get technician by ID
// @access  Private (Admin, Supervisor, Own Profile)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find technician
    const technician = await User.findOne({
      _id: id,
      role: 'technician'
    }).select('-password');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Check authorization
    const canView = req.user.role === 'admin' || 
                   req.user.role === 'supervisor' || 
                   req.user._id.toString() === id;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { technician }
    });

  } catch (error) {
    console.error('Get technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting technician'
    });
  }
});

/**
 * @swagger
 * /api/technicians:
 *   post:
 *     summary: ➕ Create New Technician - เพิ่มช่างเทคนิคใหม่
 *     description: สร้างบัญชีช่างเทคนิคใหม่ในระบบ (เฉพาะ Admin)
 *     tags: [🔧 Technician Management]
 *     security:
 *       - BearerAuth: []
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
 *               - specialization
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: ชื่อผู้ใช้งาน
 *                 example: "electrical_tech01"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: อีเมลช่างเทคนิค
 *                 example: "electrical@company.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: รหัสผ่าน
 *                 example: "TechPassword123"
 *               firstName:
 *                 type: string
 *                 description: ชื่อจริง
 *                 example: "สมชาย"
 *               lastName:
 *                 type: string
 *                 description: นามสกุล
 *                 example: "ช่างไฟ"
 *               specialization:
 *                 type: string
 *                 enum: [electrical, plumbing, hvac, general, other]
 *                 description: ความเชี่ยวชาญ
 *                 example: "electrical"
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 description: ประสบการณ์ (ปี)
 *                 example: 5
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: หมายเลขโทรศัพท์
 *                 example: "0812345678"
 *           examples:
 *             electrical_tech:
 *               summary: ช่างไฟฟ้า
 *               value:
 *                 username: "electrical_tech01"
 *                 email: "electrical@company.com"
 *                 password: "TechPassword123"
 *                 firstName: "สมชาย"
 *                 lastName: "ช่างไฟ"
 *                 specialization: "electrical"
 *                 experience: 5
 *                 phoneNumber: "0812345678"
 *             plumbing_tech:
 *               summary: ช่างประปา
 *               value:
 *                 username: "plumber_tech01"
 *                 email: "plumber@company.com"
 *                 password: "PlumberPass123"
 *                 firstName: "สมศักดิ์"
 *                 lastName: "ช่างประปา"
 *                 specialization: "plumbing"
 *                 experience: 3
 *                 phoneNumber: "0823456789"
 *     responses:
 *       201:
 *         description: สร้างช่างเทคนิคใหม่สำเร็จ
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
 *                   example: "Technician created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     technician:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือ email/username ซ้ำ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ - ต้องเป็น Admin เท่านั้น
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   POST /api/technicians
// @desc    Create new technician
// @access  Private (Admin only)
router.post('/', [
  authenticateToken,
  authorizeRoles('admin'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  
  body('specialization')
    .isIn(['electrical', 'plumbing', 'hvac', 'general', 'other'])
    .withMessage('Invalid specialization'),
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

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      specialization,
      experience,
      phoneNumber
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

    // Generate technician ID
    const techCount = await User.countDocuments({ role: 'technician' });
    const technicianId = `TECH${String(techCount + 1).padStart(4, '0')}`;

    // Create technician
    const technician = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'technician',
      technicianId,
      specialization,
      experience,
      phoneNumber
    });

    await technician.save();

    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: { technician }
    });

  } catch (error) {
    console.error('Create technician error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating technician'
    });
  }
});

/**
 * @swagger
 * /api/technicians/{id}:
 *   put:
 *     summary: ✏️ Update Technician - แก้ไขข้อมูลช่างเทคนิค
 *     description: อัปเดตข้อมูลช่างเทคนิค (Admin สามารถแก้ไขได้ทุกฟิลด์, ช่างเทคนิคแก้ไขตัวเองได้เฉพาะบางฟิลด์)
 *     tags: [🔧 Technician Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId ของช่างเทคนิค
 *         example: "64f8a1234567890abcd12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: ชื่อจริง
 *                 example: "สมชาย"
 *               lastName:
 *                 type: string
 *                 description: นามสกุล
 *                 example: "ช่างไฟใหม่"
 *               specialization:
 *                 type: string
 *                 enum: [electrical, plumbing, hvac, general, other]
 *                 description: ความเชี่ยวชาญ
 *                 example: "hvac"
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 description: ประสบการณ์ (ปี)
 *                 example: 7
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: หมายเลขโทรศัพท์
 *                 example: "0898765432"
 *               isActive:
 *                 type: boolean
 *                 description: สถานะการใช้งาน (เฉพาะ admin)
 *                 example: true
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้ (เฉพาะ admin)
 *                 example: "new_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: อีเมล (เฉพาะ admin)
 *                 example: "new_email@company.com"
 *           examples:
 *             basic_update:
 *               summary: อัปเดตข้อมูลพื้นฐาน
 *               value:
 *                 firstName: "สมชาย"
 *                 lastName: "ช่างไฟใหม่"
 *                 phoneNumber: "0898765432"
 *                 experience: 7
 *             admin_update:
 *               summary: อัปเดตโดย Admin (ฟิลด์เพิ่มเติม)
 *               value:
 *                 firstName: "สมชาย"
 *                 lastName: "ช่างไฟใหม่"
 *                 phoneNumber: "0898765432"
 *                 specialization: "hvac"
 *                 experience: 7
 *                 isActive: true
 *                 username: "new_username"
 *                 email: "newemail@company.com"
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลช่างเทคนิคสำเร็จ
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
 *                   example: "Technician updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     technician:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรือไม่มีข้อมูลให้อัปเดต
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ - ไม่สามารถแก้ไขข้อมูลนี้ได้
 *       404:
 *         description: ไม่พบช่างเทคนิค
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */

// @route   PUT /api/technicians/:id
// @desc    Update technician
// @access  Private (Admin, Own Profile)
router.put('/:id', [
  authenticateToken,
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  
  body('specialization')
    .optional()
    .isIn(['electrical', 'plumbing', 'hvac', 'general', 'other'])
    .withMessage('Invalid specialization'),
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

    const { id } = req.params;
    
    // Check authorization
    const canUpdate = req.user.role === 'admin' || 
                     req.user._id.toString() === id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find technician
    const technician = await User.findOne({
      _id: id,
      role: 'technician'
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Define allowed updates based on user role
    let allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'specialization', 'experience'];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedUpdates.push('isActive', 'username', 'email');
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

    // Update technician
    const updatedTechnician = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Technician updated successfully',
      data: { technician: updatedTechnician }
    });

  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating technician'
    });
  }
});

/**
 * @swagger
 * /api/technicians/{id}:
 *   delete:
 *     summary: 🗑️ Delete Technician - ปิดการใช้งานช่างเทคนิค
 *     description: ปิดการใช้งานบัญชีช่างเทคนิค (Soft Delete - เปลี่ยน isActive เป็น false) เฉพาะ Admin เท่านั้น
 *     tags: [🔧 Technician Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId ของช่างเทคนิค
 *         example: "64f8a1234567890abcd12345"
 *     responses:
 *       200:
 *         description: ปิดการใช้งานช่างเทคนิคสำเร็จ
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
 *                   example: "Technician deactivated successfully"
 *       401:
 *         description: ไม่ได้รับอนุญาต - ต้อง login ก่อน
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ - ต้องเป็น Admin เท่านั้น
 *       404:
 *         description: ไม่พบช่างเทคนิค
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   DELETE /api/technicians/:id
// @desc    Delete technician (soft delete - set isActive to false)
// @access  Private (Admin only)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await User.findOne({
      _id: id,
      role: 'technician'
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Soft delete - set isActive to false
    technician.isActive = false;
    await technician.save();

    res.json({
      success: true,
      message: 'Technician deactivated successfully'
    });

  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting technician'
    });
  }
});

module.exports = router;