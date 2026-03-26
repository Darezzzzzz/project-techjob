const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

// Temporary in-memory storage (for demonstration when MongoDB is not connected)
let jobs = [
  {
    id: 'JOB0001',
    jobId: 'JOB0001',
    title: 'ซ่อมระบบไฟฟ้า อาคาร A',
    description: 'ตรวจสอบและซ่อมแซมระบบไฟฟ้าที่มีปัญหา',
    location: 'อาคาร A ชั้น 3',
    priority: 'high',
    status: 'pending',
    category: 'electrical',
    estimatedHours: 4,
    deadline: '2026-03-30T09:00:00.000Z',
    createdAt: new Date().toISOString()
  },
  {
    id: 'JOB0002', 
    jobId: 'JOB0002',
    title: 'ติดตั้งเครื่องปรับอากาศใหม่',
    description: 'ติดตั้งแอร์ใหม่ในห้องประชุม',
    location: 'ห้องประชุม B201',
    priority: 'medium',
    status: 'in_progress',
    category: 'installation',
    estimatedHours: 6,
    deadline: '2026-04-02T14:00:00.000Z',
    createdAt: new Date().toISOString()
  }
];

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: ดูรายการงานทั้งหมด
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: รายการงานทั้งหมด
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
 *                   example: "ดึงรายการงานสำเร็จ"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "JOB0001"
 *                       title:
 *                         type: string
 *                         example: "ซ่อมระบบไฟฟ้า อาคาร A"
 *                       description:
 *                         type: string
 *                         example: "ตรวจสอบและซ่อมแซมระบบไฟฟ้าที่มีปัญหา"
 *                       location:
 *                         type: string
 *                         example: "อาคาร A ชั้น 3"
 *                       priority:
 *                         type: string
 *                         example: "high"
 *                       status:
 *                         type: string  
 *                         example: "pending"
 */
// GET /api/jobs - ดูรายการงานทั้งหมด
router.get('/', async (req, res) => {
  try {
    console.log('\n📋 GET JOBS REQUEST');
    
    // Try MongoDB first, fall back to in-memory storage
    let jobsList = jobs;
    
    try {
      if (mongoose.connection.readyState === 1) {
        jobsList = await Job.find()
          .populate('assignedTo', 'firstName lastName username')
          .populate('createdBy', 'firstName lastName username')
          .sort({ createdAt: -1 });
      } else {
        console.log('📝 Using in-memory storage for jobs');
      }
    } catch (dbError) {
      console.log('⚠️ Database query failed, using in-memory storage');
    }

    console.log('✅ Jobs retrieved:', jobsList.length);
    
    res.json({
      success: true,
      message: '✅ ดึงรายการงานสำเร็จ',
      data: jobsList,
      total: jobsList.length
    });

  } catch (error) {
    console.error('\n🚨 GET JOBS ERROR:');
    console.error('Message:', error.message);
    
    res.status(500).json({
      success: false,
      message: '🚨 เกิดข้อผิดพลาดในการดึงข้อมูลงาน',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: สร้างงานใหม่
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description  
 *               - location
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: "ซ่อมระบบประปา อาคาร B"
 *               description:
 *                 type: string
 *                 example: "ซ่อมท่อประปาที่รั่ว ชั้น 2"
 *               location:
 *                 type: string
 *                 example: "อาคาร B ชั้น 2"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: "high"
 *               category:
 *                 type: string
 *                 enum: [electrical, plumbing, maintenance, installation, repair, other]
 *                 example: "plumbing"
 *               estimatedHours:
 *                 type: number
 *                 example: 3
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-30T09:00:00.000Z"
 *     responses:
 *       201:
 *         description: สร้างงานสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 */
// POST /api/jobs - สร้างงานใหม่
router.post('/', [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('งาน ต้อง 5-100 ตัวอักษร'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('คำอธิบาย ต้อง 10-500 ตัวอักษร'),
  body('location').trim().notEmpty().withMessage('ต้องระบุสถานที่'),
  body('deadline').isISO8601().withMessage('วันที่ต้องเป็นรูปแบบ ISO 8601'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('ระดับความสำคัญไม่ถูกต้อง'),
  body('category').optional().isIn(['electrical', 'plumbing', 'maintenance', 'installation', 'repair', 'other']).withMessage('หมวดหมู่ไม่ถูกต้อง'),
  body('estimatedHours').optional().isNumeric().withMessage('ชั่วโมงประมาณต้องเป็นตัวเลข')
], async (req, res) => {
  try {
    console.log('\n📝 CREATE JOB REQUEST:');
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

    const { title, description, location, priority = 'medium', category = 'other', estimatedHours = 1, deadline } = req.body;

    // Create new job
    const newJob = {
      id: `JOB${String(jobs.length + 1).padStart(4, '0')}`, // JOB0003, JOB0004, etc.
      jobId: `JOB${String(jobs.length + 1).padStart(4, '0')}`,
      title,
      description,
      location,
      priority,
      category,
      estimatedHours: Number(estimatedHours),
      deadline,
      status: 'pending',
      actualHours: 0,
      createdAt: new Date().toISOString(),
      notes: ''
    };

    // Try to save to MongoDB, otherwise use in-memory storage
    try {
      if (mongoose.connection.readyState === 1) {
        // For demo: create fake user ID for createdBy
        const job = new Job({
          ...newJob,
          createdBy: new mongoose.Types.ObjectId() // Fake ObjectId
        });
        await job.save();
        console.log('✅ Job saved to database:', job.jobId);
      } else {
        jobs.push(newJob);
        console.log('📝 Job added to in-memory storage:', newJob.jobId);
      }
    } catch (dbError) {
      console.log('⚠️ Database save failed, using in-memory storage');
      jobs.push(newJob);
    }

    console.log('✅ Job created successfully:', newJob.jobId);
    
    res.status(201).json({
      success: true,
      message: '✅ สร้างงานใหม่สำเร็จ',
      data: newJob
    });

  } catch (error) {
    console.error('\n🚨 CREATE JOB ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      message: '🚨 เกิดข้อผิดพลาดในการสร้างงาน',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;