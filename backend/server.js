const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure uploads directories exist
['uploads/images', 'uploads/documents'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Fail fast if required secrets are missing ──────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
  process.exit(1);
}
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.error('FATAL: MONGO_URI (or MONGODB_URI) environment variable is not set. Server will not start.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'https://student-desk-bf8j.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Campus Helpdesk API is running',
    timestamp: new Date().toISOString()
  });
});

// Health Check — includes DB state and uptime for cold-start detection
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  // Optionally ping DB to confirm liveness
  let dbPingMs = null;
  if (dbState === 1) {
    try {
      const t0 = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - t0;
    } catch (_) { /* non-fatal */ }
  }

  res.json({
    success: true,
    message: 'Server is healthy',
    database: dbStatus,
    dbPingMs,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const postRoutes = require('./routes/postRoutes');
const aiRoutes = require('./routes/aiRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/student', dashboardRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/students', studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Smart Campus Helpdesk Server Started');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));

  // Start daily backup scheduler
  const { startBackupScheduler } = require('./services/backupScheduler');
  startBackupScheduler();

  // Auto-escalation: run every 6 hours
  const Complaint = require('./models/Complaint');
  const Admin = require('./models/Admin');
  const { createNotification } = require('./controllers/notificationController');

  async function runAutoEscalation() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const toEscalate = await Complaint.find({
        status: { $in: ['Pending', 'In Progress'] },
        isEscalated: false,
        createdAt: { $lte: threeDaysAgo }
      });
      if (toEscalate.length === 0) return;

      const admin = await Admin.findOne();
      for (const complaint of toEscalate) {
        complaint.isEscalated = true;
        complaint.escalatedAt = new Date();
        complaint.status = 'Escalated';
        complaint.statusHistory.push({
          status: 'Escalated',
          changedByName: 'System',
          timestamp: new Date(),
          note: 'Auto-escalated: not resolved within 3 days'
        });
        await complaint.save();

        if (admin) {
          await createNotification({
            recipient: admin._id,
            recipientModel: 'Admin',
            type: 'complaint_escalated',
            title: 'Complaint Escalated',
            message: `Complaint ${complaint.complaintId} ("${complaint.title}") by ${complaint.studentName} auto-escalated after 3 days.`,
            relatedId: complaint._id,
            relatedModel: 'Complaint'
          });
        }
        await createNotification({
          recipient: complaint.student,
          recipientModel: 'Student',
          type: 'complaint_escalated',
          title: 'Complaint Escalated',
          message: `Your complaint "${complaint.title}" (${complaint.complaintId}) has been escalated to admin for priority resolution.`,
          relatedId: complaint._id,
          relatedModel: 'Complaint'
        });
      }
      console.log(`[Auto-Escalation] Escalated ${toEscalate.length} complaint(s)`);
    } catch (err) {
      console.error('[Auto-Escalation] Error:', err.message);
    }
  }

  // Run after DB connects, then every 6 hours
  mongoose.connection.once('open', () => {
    setTimeout(runAutoEscalation, 5000);
    setInterval(runAutoEscalation, 6 * 60 * 60 * 1000);
  });
});

module.exports = app;
