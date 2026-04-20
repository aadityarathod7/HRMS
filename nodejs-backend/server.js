const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initSocket(server);

// Middleware
app.use(cors({
  origin: true, // Allow all origins - restrict via Render env if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/role', require('./routes/role'));
app.use('/departments', require('./routes/department'));
app.use('/leaverequests', require('./routes/leaveRequest'));
app.use('/manager', require('./routes/manager'));
app.use('/file', require('./routes/file'));
app.use('/project', require('./routes/project'));
app.use('/Leaves', require('./routes/leaves'));
app.use('/timesheets', require('./routes/timesheet'));
app.use('/attendance', require('./routes/attendance'));
app.use('/payroll', require('./routes/payroll'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/events', require('./routes/event'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`HRMS Sanvii server running on port ${PORT}`);
  });

  const { runMonthlyAccrual, runYearReset } = require('./services/leaveAccrualService');

  // Monthly accrual — runs at 00:01 on 1st of every month
  cron.schedule('1 0 1 * *', async () => {
    console.log('[Cron] Running monthly leave accrual...');
    await runMonthlyAccrual();
  }, { timezone: 'Asia/Kolkata' });

  // Year reset — runs at 00:00 on Jan 1
  cron.schedule('0 0 1 1 *', async () => {
    console.log('[Cron] Running yearly leave reset...');
    await runYearReset();
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Cron] Leave accrual jobs scheduled (IST)');
});
