const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Role = require('./models/Role');
const Department = require('./models/Department');
const LeaveRequest = require('./models/LeaveRequest');
const LeaveBalance = require('./models/LeaveBalance');
const Project = require('./models/Project');
const UploadedFile = require('./models/UploadedFile');
const Timesheet = require('./models/Timesheet');
const Attendance = require('./models/Attendance');
const Payroll = require('./models/Payroll');

const clear = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Department.deleteMany({}),
      LeaveRequest.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Project.deleteMany({}),
      UploadedFile.deleteMany({}),
      Timesheet.deleteMany({}),
      Attendance.deleteMany({}),
      Payroll.deleteMany({}),
    ]);
    console.log('All collections cleared');

    // Re-create essential roles
    const roles = await Role.insertMany([
      { role: 'ADMIN',    description: 'Administrator', isActive: true },
      { role: 'HR',       description: 'HR Manager',    isActive: true },
      { role: 'MANAGER',  description: 'Team Manager',  isActive: true },
      { role: 'EMPLOYEE', description: 'Employee',      isActive: true },
      { role: 'INTERN',   description: 'Intern',        isActive: true },
    ]);
    console.log('Roles created');

    const adminRole = roles.find(r => r.role === 'ADMIN');

    // Re-create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      firstname: 'Super',
      lastname: 'Admin',
      userName: 'admin',
      email: 'admin@sanvii.com',
      password: hashedPassword,
      employeeId: 'ST-01',
      roles: [adminRole._id],
      isActive: true,
      status: 'ACTIVE',
      createdBy: 'system',
      createdDate: new Date(),
    });
    console.log('Admin user created: admin / Admin@123');

    console.log('\nDone. All seeded data removed, fresh start ready.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

clear();
