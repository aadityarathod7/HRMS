const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
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
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`HRMS Sanvii server running on port ${PORT}`);
  });
});
