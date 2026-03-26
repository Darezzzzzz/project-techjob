const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 1
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['electrical', 'plumbing', 'maintenance', 'installation', 'repair', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-generate jobId before saving
jobSchema.pre('save', async function(next) {
  if (!this.jobId) {
    const count = await mongoose.model('Job').countDocuments();
    this.jobId = `JOB${String(count + 1).padStart(4, '0')}`; // JOB0001, JOB0002, etc.
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);