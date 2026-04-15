const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Role = require('./models/Role');
const Department = require('./models/Department');
const LeaveRequest = require('./models/LeaveRequest');
const Project = require('./models/Project');
const UploadedFile = require('./models/UploadedFile');
const MenuItem = require('./models/MenuItem');
const MenuAction = require('./models/MenuAction');
const RoleMenuAction = require('./models/RoleMenuAction');
const Timesheet = require('./models/Timesheet');
const Attendance = require('./models/Attendance');
const Payroll = require('./models/Payroll');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Department.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Project.deleteMany({}),
      UploadedFile.deleteMany({}),
      MenuItem.deleteMany({}),
      MenuAction.deleteMany({}),
      RoleMenuAction.deleteMany({}),
      Timesheet.deleteMany({}),
      Attendance.deleteMany({}),
      Payroll.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // --- ROLES ---
    const roles = await Role.insertMany([
      { role: 'ADMIN', description: 'Full system access', createdBy: 'system', isActive: true },
      { role: 'HR', description: 'Human Resources management', createdBy: 'system', isActive: true },
      { role: 'MANAGER', description: 'Team and project management', createdBy: 'system', isActive: true },
      { role: 'EMPLOYEE', description: 'Regular employee access', createdBy: 'system', isActive: true },
      { role: 'INTERN', description: 'Limited intern access', createdBy: 'system', isActive: true }
    ]);
    console.log('Seeded 5 roles');

    const adminRole = roles[0];
    const hrRole = roles[1];
    const managerRole = roles[2];
    const employeeRole = roles[3];
    const internRole = roles[4];

    // --- DEPARTMENTS ---
    const departments = await Department.insertMany([
      { departmentName: 'Engineering', contactPerson: 'Rahul Sharma', createdBy: 'system', isActive: true },
      { departmentName: 'Human Resources', contactPerson: 'Priya Patel', createdBy: 'system', isActive: true },
      { departmentName: 'Marketing', contactPerson: 'Amit Desai', createdBy: 'system', isActive: true },
      { departmentName: 'Finance', contactPerson: 'Sneha Kulkarni', createdBy: 'system', isActive: true },
      { departmentName: 'Design', contactPerson: 'Vikram Mehta', createdBy: 'system', isActive: true },
      { departmentName: 'Sales', contactPerson: 'Neha Gupta', createdBy: 'system', isActive: true },
      { departmentName: 'QA Testing', contactPerson: 'Arjun Reddy', createdBy: 'system', isActive: false }
    ]);
    console.log('Seeded 7 departments');

    // --- USERS ---
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      {
        userName: 'admin',
        password: hashedPassword,
        firstname: 'Aaditya',
        lastname: 'Rathod',
        dob: new Date('1990-05-15'),
        contactNumber: '9977737801',
        branch: 'IT',
        bloodGroup: 'O+',
        dateOfJoining: new Date('2020-01-10'),
        isActive: true,
        address: 'Pune, Maharashtra',
        email: 'admin@sanvii.com',
        gender: 'MALE',
        roles: [adminRole._id],
        createdBy: 'system'
      },
      {
        userName: 'priya.hr',
        password: hashedPassword,
        firstname: 'Priya',
        lastname: 'Patel',
        dob: new Date('1992-08-22'),
        contactNumber: '9876543210',
        branch: 'HR',
        bloodGroup: 'A+',
        dateOfJoining: new Date('2021-03-15'),
        isActive: true,
        address: 'Mumbai, Maharashtra',
        email: 'priya@sanvii.com',
        gender: 'FEMALE',
        roles: [hrRole._id],
        createdBy: 'system'
      },
      {
        userName: 'rahul.mgr',
        password: hashedPassword,
        firstname: 'Rahul',
        lastname: 'Sharma',
        dob: new Date('1988-12-03'),
        contactNumber: '9123456789',
        branch: 'IT',
        bloodGroup: 'B+',
        dateOfJoining: new Date('2019-06-20'),
        isActive: true,
        address: 'Bangalore, Karnataka',
        email: 'rahul@sanvii.com',
        gender: 'MALE',
        roles: [managerRole._id],
        createdBy: 'system'
      },
      {
        userName: 'sneha.dev',
        password: hashedPassword,
        firstname: 'Sneha',
        lastname: 'Kulkarni',
        dob: new Date('1995-03-18'),
        contactNumber: '9988776655',
        branch: 'IT',
        bloodGroup: 'AB+',
        dateOfJoining: new Date('2022-07-01'),
        isActive: true,
        address: 'Hyderabad, Telangana',
        email: 'sneha@sanvii.com',
        gender: 'FEMALE',
        roles: [employeeRole._id],
        createdBy: 'system'
      },
      {
        userName: 'vikram.design',
        password: hashedPassword,
        firstname: 'Vikram',
        lastname: 'Mehta',
        dob: new Date('1993-07-25'),
        contactNumber: '9112233445',
        branch: 'Design',
        bloodGroup: 'O-',
        dateOfJoining: new Date('2021-11-10'),
        isActive: true,
        address: 'Chennai, Tamil Nadu',
        email: 'vikram@sanvii.com',
        gender: 'MALE',
        roles: [employeeRole._id],
        createdBy: 'system'
      },
      {
        userName: 'neha.sales',
        password: hashedPassword,
        firstname: 'Neha',
        lastname: 'Gupta',
        dob: new Date('1996-11-08'),
        contactNumber: '9556677889',
        branch: 'Sales',
        bloodGroup: 'B-',
        dateOfJoining: new Date('2023-02-14'),
        isActive: true,
        address: 'Delhi, NCR',
        email: 'neha@sanvii.com',
        gender: 'FEMALE',
        roles: [employeeRole._id],
        createdBy: 'system'
      },
      {
        userName: 'arjun.qa',
        password: hashedPassword,
        firstname: 'Arjun',
        lastname: 'Reddy',
        dob: new Date('1994-01-30'),
        contactNumber: '9334455667',
        branch: 'QA',
        bloodGroup: 'A-',
        dateOfJoining: new Date('2022-09-05'),
        isActive: true,
        address: 'Nagpur, Maharashtra',
        email: 'arjun@sanvii.com',
        gender: 'MALE',
        roles: [employeeRole._id],
        createdBy: 'system'
      },
      {
        userName: 'amit.intern',
        password: hashedPassword,
        firstname: 'Amit',
        lastname: 'Desai',
        dob: new Date('2000-04-12'),
        contactNumber: '9778899001',
        branch: 'IT',
        bloodGroup: 'O+',
        dateOfJoining: new Date('2024-01-08'),
        isActive: false,
        address: 'Indore, MP',
        email: 'amit@sanvii.com',
        gender: 'MALE',
        roles: [internRole._id],
        createdBy: 'system'
      }
    ]);
    console.log('Seeded 8 users');

    // --- LEAVE REQUESTS ---
    await LeaveRequest.insertMany([
      {
        userId: users[3]._id,
        reportingManagerId: users[2]._id,
        leaveStartDate: new Date('2026-04-20'),
        leaveEndDate: new Date('2026-04-22'),
        leaveType: 'CASUAL',
        description: 'Family function',
        leaveStatus: 'PENDING',
        createdBy: 'sneha.dev'
      },
      {
        userId: users[4]._id,
        reportingManagerId: users[2]._id,
        leaveStartDate: new Date('2026-04-25'),
        leaveEndDate: new Date('2026-04-25'),
        leaveType: 'SICK',
        description: 'Not feeling well',
        leaveStatus: 'APPROVED',
        createdBy: 'vikram.design'
      },
      {
        userId: users[5]._id,
        reportingManagerId: users[2]._id,
        leaveStartDate: new Date('2026-05-01'),
        leaveEndDate: new Date('2026-05-05'),
        leaveType: 'ANNUAL',
        description: 'Vacation trip',
        leaveStatus: 'PENDING',
        createdBy: 'neha.sales'
      },
      {
        userId: users[6]._id,
        reportingManagerId: users[2]._id,
        leaveStartDate: new Date('2026-03-10'),
        leaveEndDate: new Date('2026-03-12'),
        leaveType: 'CASUAL',
        description: 'Personal work',
        leaveStatus: 'REJECTED',
        createdBy: 'arjun.qa'
      },
      {
        userId: users[3]._id,
        reportingManagerId: users[2]._id,
        leaveStartDate: new Date('2026-05-15'),
        leaveEndDate: new Date('2026-05-16'),
        leaveType: 'SICK',
        description: 'Doctor appointment',
        leaveStatus: 'APPROVED',
        createdBy: 'sneha.dev'
      },
      {
        userId: users[1]._id,
        reportingManagerId: users[0]._id,
        leaveStartDate: new Date('2026-06-01'),
        leaveEndDate: new Date('2026-06-03'),
        leaveType: 'ANNUAL',
        description: 'Wedding anniversary',
        leaveStatus: 'PENDING',
        createdBy: 'priya.hr'
      }
    ]);
    console.log('Seeded 6 leave requests');

    // --- PROJECTS ---
    const projects = await Project.insertMany([
      {
        projectId: 'Sanvii-001',
        name: 'HRMS Portal',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        description: 'Internal HR Management System for Sanvii Techmet',
        teamMembers: 'Aaditya Rathod, Sneha Kulkarni, Arjun Reddy',
        status: 'ACTIVE',
        createdBy: 'admin'
      },
      {
        projectId: 'Sanvii-002',
        name: 'E-Commerce Platform',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-02-28'),
        description: 'Full-stack e-commerce solution for retail client',
        teamMembers: 'Rahul Sharma, Vikram Mehta, Neha Gupta',
        status: 'ACTIVE',
        createdBy: 'admin'
      },
      {
        projectId: 'Sanvii-003',
        name: 'Mobile Banking App',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-05-31'),
        description: 'Banking application for a fintech startup',
        teamMembers: 'Sneha Kulkarni, Arjun Reddy',
        status: 'COMPLETED',
        createdBy: 'admin'
      },
      {
        projectId: 'Sanvii-004',
        name: 'AI Chatbot',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-08-31'),
        description: 'Customer support chatbot with AI/ML capabilities',
        teamMembers: 'Rahul Sharma, Amit Desai',
        status: 'ONHOLD',
        createdBy: 'admin'
      },
      {
        projectId: 'Sanvii-005',
        name: 'CRM Dashboard',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        description: 'Customer Relationship Management dashboard',
        teamMembers: 'Vikram Mehta, Neha Gupta, Priya Patel',
        status: 'ACTIVE',
        createdBy: 'admin'
      }
    ]);
    console.log('Seeded 5 projects');

    // --- UPLOADED FILES ---
    await UploadedFile.insertMany([
      { uploadedBy: 'admin', fileName: 'employee_handbook.pdf', fileType: 'application/pdf', fileSize: 2048576 },
      { uploadedBy: 'priya.hr', fileName: 'leave_policy_2026.csv', fileType: 'text/csv', fileSize: 15360 },
      { uploadedBy: 'rahul.mgr', fileName: 'project_timeline.csv', fileType: 'text/csv', fileSize: 8192 },
      { uploadedBy: 'admin', fileName: 'salary_structure.csv', fileType: 'text/csv', fileSize: 12288 },
      { uploadedBy: 'sneha.dev', fileName: 'meeting_notes.txt', fileType: 'text/plain', fileSize: 4096 }
    ]);
    console.log('Seeded 5 uploaded files');

    // --- MENU ITEMS & ACTIONS ---
    const menuItems = await MenuItem.insertMany([
      { name: 'Employee Management' },
      { name: 'Role Management' },
      { name: 'Department Management' },
      { name: 'Leave Management' },
      { name: 'Project Management' },
      { name: 'Documents' }
    ]);

    const menuActions = await MenuAction.insertMany([
      { actionName: 'VIEW', menuItem: menuItems[0]._id },
      { actionName: 'CREATE', menuItem: menuItems[0]._id },
      { actionName: 'EDIT', menuItem: menuItems[0]._id },
      { actionName: 'DELETE', menuItem: menuItems[0]._id },
      { actionName: 'VIEW', menuItem: menuItems[1]._id },
      { actionName: 'CREATE', menuItem: menuItems[1]._id },
      { actionName: 'VIEW', menuItem: menuItems[3]._id },
      { actionName: 'APPROVE', menuItem: menuItems[3]._id }
    ]);

    await RoleMenuAction.insertMany([
      { role: adminRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: adminRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[1]._id, isAllowed: true },
      { role: adminRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[2]._id, isAllowed: true },
      { role: adminRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[3]._id, isAllowed: true },
      { role: hrRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: hrRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[1]._id, isAllowed: true },
      { role: employeeRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: employeeRole._id, menuItem: menuItems[0]._id, menuAction: menuActions[2]._id, isAllowed: false },
      { role: managerRole._id, menuItem: menuItems[3]._id, menuAction: menuActions[6]._id, isAllowed: true },
      { role: managerRole._id, menuItem: menuItems[3]._id, menuAction: menuActions[7]._id, isAllowed: true }
    ]);
    console.log('Seeded menu items, actions & permissions');

    // --- TIMESHEETS ---
    await Timesheet.insertMany([
      { userId: users[3]._id, date: new Date('2026-04-14'), hoursWorked: 8, project: projects[0]._id, taskDescription: 'API integration for user module', status: 'APPROVED', createdBy: 'sneha.dev' },
      { userId: users[3]._id, date: new Date('2026-04-15'), hoursWorked: 7, project: projects[0]._id, taskDescription: 'Bug fixes in leave management', status: 'PENDING', createdBy: 'sneha.dev' },
      { userId: users[4]._id, date: new Date('2026-04-14'), hoursWorked: 8, project: projects[1]._id, taskDescription: 'UI design for product page', status: 'APPROVED', createdBy: 'vikram.design' },
      { userId: users[4]._id, date: new Date('2026-04-15'), hoursWorked: 6, project: projects[1]._id, taskDescription: 'Responsive layout fixes', status: 'PENDING', createdBy: 'vikram.design' },
      { userId: users[5]._id, date: new Date('2026-04-14'), hoursWorked: 8, project: projects[4]._id, taskDescription: 'Client demo preparation', status: 'APPROVED', createdBy: 'neha.sales' },
      { userId: users[5]._id, date: new Date('2026-04-15'), hoursWorked: 5, project: projects[4]._id, taskDescription: 'CRM dashboard wireframes', status: 'REJECTED', createdBy: 'neha.sales' },
      { userId: users[6]._id, date: new Date('2026-04-14'), hoursWorked: 8, project: projects[0]._id, taskDescription: 'Test case writing for auth module', status: 'APPROVED', createdBy: 'arjun.qa' },
      { userId: users[6]._id, date: new Date('2026-04-15'), hoursWorked: 7, project: projects[0]._id, taskDescription: 'Regression testing', status: 'PENDING', createdBy: 'arjun.qa' },
      { userId: users[2]._id, date: new Date('2026-04-14'), hoursWorked: 6, project: projects[1]._id, taskDescription: 'Sprint planning & code review', status: 'APPROVED', createdBy: 'rahul.mgr' },
      { userId: users[2]._id, date: new Date('2026-04-15'), hoursWorked: 8, project: projects[3]._id, taskDescription: 'AI chatbot architecture design', status: 'PENDING', createdBy: 'rahul.mgr' },
      { userId: users[3]._id, date: new Date('2026-04-11'), hoursWorked: 8, project: projects[0]._id, taskDescription: 'Database schema optimization', status: 'APPROVED', createdBy: 'sneha.dev' },
      { userId: users[4]._id, date: new Date('2026-04-11'), hoursWorked: 7, project: projects[1]._id, taskDescription: 'Icon set design', status: 'APPROVED', createdBy: 'vikram.design' },
      { userId: users[6]._id, date: new Date('2026-04-11'), hoursWorked: 8, project: projects[2]._id, taskDescription: 'Performance testing', status: 'APPROVED', createdBy: 'arjun.qa' },
      { userId: users[3]._id, date: new Date('2026-04-10'), hoursWorked: 7, project: projects[0]._id, taskDescription: 'JWT token refresh implementation', status: 'APPROVED', createdBy: 'sneha.dev' },
      { userId: users[5]._id, date: new Date('2026-04-10'), hoursWorked: 6, project: projects[4]._id, taskDescription: 'Sales report generation', status: 'APPROVED', createdBy: 'neha.sales' },
      { userId: users[2]._id, date: new Date('2026-04-10'), hoursWorked: 8, project: projects[1]._id, taskDescription: 'Deployment pipeline setup', status: 'APPROVED', createdBy: 'rahul.mgr' },
      { userId: users[4]._id, date: new Date('2026-04-09'), hoursWorked: 8, project: projects[1]._id, taskDescription: 'Checkout flow redesign', status: 'APPROVED', createdBy: 'vikram.design' },
      { userId: users[6]._id, date: new Date('2026-04-09'), hoursWorked: 7, project: projects[0]._id, taskDescription: 'Smoke testing after deploy', status: 'APPROVED', createdBy: 'arjun.qa' },
      { userId: users[3]._id, date: new Date('2026-04-08'), hoursWorked: 8, project: projects[0]._id, taskDescription: 'WebSocket notification system', status: 'APPROVED', createdBy: 'sneha.dev' },
      { userId: users[5]._id, date: new Date('2026-04-08'), hoursWorked: 5, project: projects[4]._id, taskDescription: 'Lead follow-up calls', status: 'REJECTED', createdBy: 'neha.sales' },
    ]);
    console.log('Seeded 20 timesheet entries');

    // --- ATTENDANCE ---
    const attendanceData = [];
    const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'];
    const checkIns = ['08:45', '09:00', '09:15', '09:30', '10:00', '', ''];
    const checkOuts = ['17:30', '18:00', '18:15', '17:45', '13:00', '', ''];

    for (let day = 1; day <= 15; day++) {
      for (let u = 2; u <= 6; u++) {
        const dayOfWeek = new Date(2026, 3, day).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        const statusIdx = Math.floor(Math.random() * statuses.length);
        const status = statuses[statusIdx];
        attendanceData.push({
          userId: users[u]._id,
          date: new Date(2026, 3, day),
          checkIn: status === 'ABSENT' || status === 'ON_LEAVE' ? '' : checkIns[Math.floor(Math.random() * 4)],
          checkOut: status === 'ABSENT' || status === 'ON_LEAVE' ? '' : checkOuts[Math.floor(Math.random() * 4)],
          status,
          notes: status === 'ABSENT' ? 'No show' : status === 'ON_LEAVE' ? 'On approved leave' : status === 'HALF_DAY' ? 'Left early' : '',
        });
      }
    }
    await Attendance.insertMany(attendanceData);
    console.log(`Seeded ${attendanceData.length} attendance records`);

    // --- PAYROLL ---
    const salaries = [
      { user: 0, basic: 120000, allow: 25000, deduct: 18000 },
      { user: 1, basic: 85000, allow: 15000, deduct: 12000 },
      { user: 2, basic: 110000, allow: 22000, deduct: 16000 },
      { user: 3, basic: 75000, allow: 12000, deduct: 10000 },
      { user: 4, basic: 80000, allow: 14000, deduct: 11000 },
      { user: 5, basic: 70000, allow: 10000, deduct: 9000 },
      { user: 6, basic: 72000, allow: 11000, deduct: 9500 },
      { user: 7, basic: 25000, allow: 3000, deduct: 2000 },
    ];
    const payrollEntries = [];
    for (const s of salaries) {
      // March - PAID
      payrollEntries.push({
        userId: users[s.user]._id,
        month: 'March', year: 2026,
        basicSalary: s.basic, allowances: s.allow, deductions: s.deduct,
        netSalary: s.basic + s.allow - s.deduct,
        status: 'PAID', paidDate: new Date('2026-03-28'),
        createdBy: 'admin'
      });
      // April - mix of statuses
      const aprilStatus = s.user <= 2 ? 'PROCESSED' : s.user <= 5 ? 'PENDING' : 'PENDING';
      payrollEntries.push({
        userId: users[s.user]._id,
        month: 'April', year: 2026,
        basicSalary: s.basic, allowances: s.allow, deductions: s.deduct,
        netSalary: s.basic + s.allow - s.deduct,
        status: aprilStatus,
        createdBy: 'admin'
      });
    }
    await Payroll.insertMany(payrollEntries);
    console.log(`Seeded ${payrollEntries.length} payroll records`);

    console.log('\n--- SEED COMPLETE ---');
    console.log('Login credentials for all users: password123');
    console.log('Admin: admin / password123');
    console.log('HR: priya.hr / password123');
    console.log('Manager: rahul.mgr / password123');
    console.log('Employee: sneha.dev / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
