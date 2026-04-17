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

    await Promise.all([
      User.deleteMany({}), Role.deleteMany({}), Department.deleteMany({}),
      LeaveRequest.deleteMany({}), LeaveBalance.deleteMany({}), Project.deleteMany({}),
      UploadedFile.deleteMany({}), MenuItem.deleteMany({}), MenuAction.deleteMany({}),
      RoleMenuAction.deleteMany({}), Timesheet.deleteMany({}), Attendance.deleteMany({}),
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

    // --- DEPARTMENTS ---
    const departments = await Department.insertMany([
      { departmentCode: 'DEPT-001', departmentName: 'Engineering', description: 'Software development and engineering', contactPerson: 'Rahul Sharma', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-002', departmentName: 'Human Resources', description: 'HR operations and people management', contactPerson: 'Priya Patel', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-003', departmentName: 'Marketing', description: 'Marketing and brand management', contactPerson: 'Amit Desai', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-004', departmentName: 'Finance', description: 'Financial operations and accounting', contactPerson: 'Sneha Kulkarni', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-005', departmentName: 'Design', description: 'UI/UX and graphic design', contactPerson: 'Vikram Mehta', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-006', departmentName: 'Sales', description: 'Sales and business development', contactPerson: 'Neha Gupta', isActive: true, createdBy: 'system' },
      { departmentCode: 'DEPT-007', departmentName: 'QA Testing', description: 'Quality assurance and testing', contactPerson: 'Arjun Reddy', isActive: true, createdBy: 'system' }
    ]);
    console.log('Seeded 7 departments');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // --- USERS (with proper HRMS fields) ---
    const users = await User.insertMany([
      { // 0 - Admin
        employeeId: 'SANVII-EMP-001', userName: 'admin', password: hashedPassword,
        firstname: 'Aaditya', lastname: 'Rathod', email: 'aaditya@sanvii.com', contactNumber: '9977737801',
        dob: new Date('1990-05-15'), gender: 'MALE', bloodGroup: 'O+', address: 'Pune, Maharashtra',
        department: departments[0]._id, designation: 'CTO', branch: 'IT',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2020-01-10'), status: 'ACTIVE', isActive: true,
        ctc: 2400000, bankAccountNumber: '1234567890', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234',
        panNumber: 'ABCDE1234F', emergencyContactName: 'Raj Rathod', emergencyContactNumber: '9988776655',
        roles: [roles[0]._id], createdBy: 'system'
      },
      { // 1 - HR
        employeeId: 'SANVII-EMP-002', userName: 'priya.hr', password: hashedPassword,
        firstname: 'Priya', lastname: 'Patel', email: 'priya@sanvii.com', contactNumber: '9876543210',
        dob: new Date('1992-08-22'), gender: 'FEMALE', bloodGroup: 'A+', address: 'Mumbai, Maharashtra',
        department: departments[1]._id, designation: 'HR Manager', branch: 'HR',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2021-03-15'), status: 'ACTIVE', isActive: true,
        ctc: 1500000, bankAccountNumber: '2345678901', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678',
        panNumber: 'FGHIJ5678K', emergencyContactName: 'Meera Patel', emergencyContactNumber: '9877665544',
        roles: [roles[1]._id], createdBy: 'system'
      },
      { // 2 - Manager
        employeeId: 'SANVII-EMP-003', userName: 'rahul.mgr', password: hashedPassword,
        firstname: 'Rahul', lastname: 'Sharma', email: 'rahul@sanvii.com', contactNumber: '9123456789',
        dob: new Date('1988-12-03'), gender: 'MALE', bloodGroup: 'B+', address: 'Bangalore, Karnataka',
        department: departments[0]._id, designation: 'Engineering Manager', branch: 'IT',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2019-06-20'), status: 'ACTIVE', isActive: true,
        ctc: 2000000, bankAccountNumber: '3456789012', bankName: 'SBI', ifscCode: 'SBIN0009876',
        panNumber: 'KLMNO9012P', emergencyContactName: 'Anita Sharma', emergencyContactNumber: '9766554433',
        roles: [roles[2]._id], createdBy: 'system'
      },
      { // 3 - Employee (dev)
        employeeId: 'SANVII-EMP-004', userName: 'sneha.dev', password: hashedPassword,
        firstname: 'Sneha', lastname: 'Kulkarni', email: 'sneha@sanvii.com', contactNumber: '9988776655',
        dob: new Date('1995-03-18'), gender: 'FEMALE', bloodGroup: 'AB+', address: 'Hyderabad, Telangana',
        department: departments[0]._id, designation: 'Senior Software Engineer', branch: 'IT',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2022-07-01'), status: 'ACTIVE', isActive: true,
        ctc: 1200000, bankAccountNumber: '4567890123', bankName: 'Axis Bank', ifscCode: 'UTIB0003456',
        roles: [roles[3]._id], createdBy: 'system'
      },
      { // 4 - Employee (design)
        employeeId: 'SANVII-EMP-005', userName: 'vikram.design', password: hashedPassword,
        firstname: 'Vikram', lastname: 'Mehta', email: 'vikram@sanvii.com', contactNumber: '9112233445',
        dob: new Date('1993-07-25'), gender: 'MALE', bloodGroup: 'O-', address: 'Chennai, Tamil Nadu',
        department: departments[4]._id, designation: 'Lead Designer', branch: 'Design',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2021-11-10'), status: 'ACTIVE', isActive: true,
        ctc: 1400000, bankAccountNumber: '5678901234', bankName: 'Kotak Bank', ifscCode: 'KKBK0004567',
        roles: [roles[3]._id], createdBy: 'system'
      },
      { // 5 - Employee (sales)
        employeeId: 'SANVII-EMP-006', userName: 'neha.sales', password: hashedPassword,
        firstname: 'Neha', lastname: 'Gupta', email: 'neha@sanvii.com', contactNumber: '9556677889',
        dob: new Date('1996-11-08'), gender: 'FEMALE', bloodGroup: 'B-', address: 'Delhi, NCR',
        department: departments[5]._id, designation: 'Sales Executive', branch: 'Sales',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2023-02-14'), status: 'ACTIVE', isActive: true,
        ctc: 900000, bankAccountNumber: '6789012345', bankName: 'PNB', ifscCode: 'PUNB0005678',
        roles: [roles[3]._id], createdBy: 'system'
      },
      { // 6 - Employee (QA)
        employeeId: 'SANVII-EMP-007', userName: 'arjun.qa', password: hashedPassword,
        firstname: 'Arjun', lastname: 'Reddy', email: 'arjun@sanvii.com', contactNumber: '9334455667',
        dob: new Date('1994-01-30'), gender: 'MALE', bloodGroup: 'A-', address: 'Nagpur, Maharashtra',
        department: departments[6]._id, designation: 'QA Lead', branch: 'QA',
        employmentType: 'FULLTIME', dateOfJoining: new Date('2022-09-05'), status: 'ACTIVE', isActive: true,
        ctc: 1100000, bankAccountNumber: '7890123456', bankName: 'BOB', ifscCode: 'BARB0006789',
        roles: [roles[3]._id], createdBy: 'system'
      },
      { // 7 - Intern (inactive)
        employeeId: 'SANVII-EMP-008', userName: 'amit.intern', password: hashedPassword,
        firstname: 'Amit', lastname: 'Desai', email: 'amit@sanvii.com', contactNumber: '9778899001',
        dob: new Date('2000-04-12'), gender: 'MALE', bloodGroup: 'O+', address: 'Indore, MP',
        department: departments[0]._id, designation: 'Software Intern', branch: 'IT',
        employmentType: 'CONTRACT', dateOfJoining: new Date('2024-01-08'), status: 'INACTIVE', isActive: false,
        ctc: 300000,
        roles: [roles[4]._id], createdBy: 'system'
      }
    ]);

    // Set reporting managers
    await User.updateMany({ _id: { $in: [users[3]._id, users[4]._id, users[6]._id, users[7]._id] } }, { reportingManager: users[2]._id });
    await User.updateOne({ _id: users[5]._id }, { reportingManager: users[1]._id });
    await User.updateOne({ _id: users[2]._id }, { reportingManager: users[0]._id });

    // Set department heads
    await Department.updateOne({ _id: departments[0]._id }, { headOfDepartment: users[2]._id });
    await Department.updateOne({ _id: departments[1]._id }, { headOfDepartment: users[1]._id });
    await Department.updateOne({ _id: departments[4]._id }, { headOfDepartment: users[4]._id });
    await Department.updateOne({ _id: departments[5]._id }, { headOfDepartment: users[5]._id });
    await Department.updateOne({ _id: departments[6]._id }, { headOfDepartment: users[6]._id });

    console.log('Seeded 8 users with org structure');

    // --- LEAVE BALANCES (2026) ---
    const leaveTypes = ['CASUAL', 'SICK', 'PRIVILEGE'];
    const leaveAllotments = { CASUAL: 12, SICK: 12, PRIVILEGE: 15 };
    const balanceEntries = [];
    for (let i = 0; i < 7; i++) { // skip inactive intern
      for (const lt of leaveTypes) {
        const used = Math.floor(Math.random() * 4);
        balanceEntries.push({
          userId: users[i]._id, leaveType: lt, year: 2026,
          totalAllotted: leaveAllotments[lt], used, available: leaveAllotments[lt] - used
        });
      }
    }
    await LeaveBalance.insertMany(balanceEntries);
    console.log(`Seeded ${balanceEntries.length} leave balances`);

    // --- LEAVE REQUESTS ---
    await LeaveRequest.insertMany([
      { userId: users[3]._id, reportingManagerId: users[2]._id, leaveStartDate: new Date('2026-04-20'), leaveEndDate: new Date('2026-04-22'), leaveType: 'CASUAL', numberOfDays: 3, description: 'Family function', leaveStatus: 'PENDING', createdBy: 'sneha.dev' },
      { userId: users[4]._id, reportingManagerId: users[2]._id, leaveStartDate: new Date('2026-04-25'), leaveEndDate: new Date('2026-04-25'), leaveType: 'SICK', numberOfDays: 1, description: 'Not feeling well', leaveStatus: 'APPROVED', approvedBy: users[2]._id, approvalDate: new Date('2026-04-24'), createdBy: 'vikram.design' },
      { userId: users[5]._id, reportingManagerId: users[1]._id, leaveStartDate: new Date('2026-05-01'), leaveEndDate: new Date('2026-05-05'), leaveType: 'PRIVILEGE', numberOfDays: 5, description: 'Vacation trip', leaveStatus: 'PENDING', createdBy: 'neha.sales' },
      { userId: users[6]._id, reportingManagerId: users[2]._id, leaveStartDate: new Date('2026-03-10'), leaveEndDate: new Date('2026-03-12'), leaveType: 'CASUAL', numberOfDays: 3, description: 'Personal work', leaveStatus: 'REJECTED', rejectionReason: 'Project deadline conflict', approvedBy: users[2]._id, createdBy: 'arjun.qa' },
      { userId: users[3]._id, reportingManagerId: users[2]._id, leaveStartDate: new Date('2026-05-15'), leaveEndDate: new Date('2026-05-15'), leaveType: 'SICK', numberOfDays: 1, halfDay: true, halfDayType: 'FIRST_HALF', description: 'Doctor appointment', leaveStatus: 'APPROVED', approvedBy: users[2]._id, approvalDate: new Date('2026-05-14'), createdBy: 'sneha.dev' },
      { userId: users[1]._id, reportingManagerId: users[0]._id, leaveStartDate: new Date('2026-06-01'), leaveEndDate: new Date('2026-06-03'), leaveType: 'PRIVILEGE', numberOfDays: 3, description: 'Wedding anniversary', leaveStatus: 'PENDING', createdBy: 'priya.hr' }
    ]);
    console.log('Seeded 6 leave requests');

    // --- PROJECTS ---
    const projects = await Project.insertMany([
      { projectId: 'Sanvii-001', name: 'HRMS Portal', description: 'Internal HR Management System', clientName: 'Sanvii Techmet', startDate: new Date('2024-01-15'), endDate: new Date('2024-12-31'), projectManager: users[2]._id, teamMembers: [users[0]._id, users[3]._id, users[6]._id], budget: 500000, priority: 'HIGH', status: 'ACTIVE', createdBy: 'admin' },
      { projectId: 'Sanvii-002', name: 'E-Commerce Platform', description: 'Full-stack e-commerce solution', clientName: 'RetailCo', startDate: new Date('2024-03-01'), endDate: new Date('2025-02-28'), projectManager: users[2]._id, teamMembers: [users[4]._id, users[5]._id], budget: 800000, priority: 'HIGH', status: 'ACTIVE', createdBy: 'admin' },
      { projectId: 'Sanvii-003', name: 'Mobile Banking App', description: 'Banking application for fintech', clientName: 'FinTech Inc', startDate: new Date('2023-06-01'), endDate: new Date('2024-05-31'), projectManager: users[2]._id, teamMembers: [users[3]._id, users[6]._id], budget: 1200000, priority: 'MEDIUM', status: 'COMPLETED', createdBy: 'admin' },
      { projectId: 'Sanvii-004', name: 'AI Chatbot', description: 'Customer support chatbot', clientName: 'SupportAI', startDate: new Date('2025-01-01'), endDate: new Date('2025-08-31'), projectManager: users[2]._id, teamMembers: [users[3]._id], budget: 300000, priority: 'LOW', status: 'ONHOLD', createdBy: 'admin' },
      { projectId: 'Sanvii-005', name: 'CRM Dashboard', description: 'Customer relationship management', clientName: 'SalesPro', startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30'), projectManager: users[2]._id, teamMembers: [users[4]._id, users[5]._id, users[1]._id], budget: 600000, priority: 'MEDIUM', status: 'ACTIVE', createdBy: 'admin' }
    ]);
    console.log('Seeded 5 projects');

    // --- TIMESHEETS ---
    const tsEntries = [];
    const tsData = [
      [3, '2026-04-14', 8, 0, 'API integration for user module', 'APPROVED'],
      [3, '2026-04-15', 7, 0, 'Bug fixes in leave management', 'PENDING'],
      [4, '2026-04-14', 8, 1, 'UI design for product page', 'APPROVED'],
      [4, '2026-04-15', 6, 1, 'Responsive layout fixes', 'PENDING'],
      [5, '2026-04-14', 8, 4, 'Client demo preparation', 'APPROVED'],
      [6, '2026-04-14', 8, 0, 'Test case writing for auth module', 'APPROVED'],
      [6, '2026-04-15', 7, 0, 'Regression testing', 'PENDING'],
      [2, '2026-04-14', 6, 1, 'Sprint planning & code review', 'APPROVED'],
      [2, '2026-04-15', 8, 3, 'AI chatbot architecture design', 'PENDING'],
      [3, '2026-04-11', 8, 0, 'Database schema optimization', 'APPROVED'],
      [4, '2026-04-11', 7, 1, 'Icon set design', 'APPROVED'],
      [6, '2026-04-11', 8, 2, 'Performance testing', 'APPROVED'],
      [3, '2026-04-10', 7, 0, 'JWT token refresh implementation', 'APPROVED'],
      [5, '2026-04-10', 6, 4, 'Sales report generation', 'APPROVED'],
      [2, '2026-04-10', 8, 1, 'Deployment pipeline setup', 'APPROVED'],
    ];
    for (const [ui, date, hours, pi, desc, status] of tsData) {
      tsEntries.push({
        userId: users[ui]._id, date: new Date(date), hoursWorked: hours,
        project: projects[pi]._id, taskDescription: desc, status, billable: true,
        approvedBy: status === 'APPROVED' ? users[2]._id : undefined,
        approvalDate: status === 'APPROVED' ? new Date(date) : undefined,
        createdBy: users[ui].userName
      });
    }
    await Timesheet.insertMany(tsEntries);
    console.log(`Seeded ${tsEntries.length} timesheet entries`);

    // --- ATTENDANCE ---
    const attEntries = [];
    const attStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'WFH', 'HALF_DAY', 'ABSENT'];
    const attLocations = ['OFFICE', 'OFFICE', 'OFFICE', 'WFH', 'OFFICE'];
    const checkIns = ['08:45', '09:00', '09:15', '09:30', '10:00'];
    const checkOuts = ['17:30', '18:00', '18:15', '17:45', '19:00'];
    for (let day = 1; day <= 15; day++) {
      const dow = new Date(2026, 3, day).getDay();
      if (dow === 0 || dow === 6) continue;
      for (let u = 2; u <= 6; u++) {
        const si = Math.floor(Math.random() * attStatuses.length);
        const s = attStatuses[si];
        const ci = s === 'ABSENT' || s === 'ON_LEAVE' ? '' : checkIns[Math.floor(Math.random() * 5)];
        const co = s === 'ABSENT' || s === 'ON_LEAVE' ? '' : checkOuts[Math.floor(Math.random() * 5)];
        const loc = s === 'WFH' ? 'WFH' : attLocations[Math.floor(Math.random() * 5)];
        attEntries.push({
          userId: users[u]._id, date: new Date(2026, 3, day),
          checkIn: ci, checkOut: co, status: s, location: loc,
          notes: s === 'ABSENT' ? 'No show' : s === 'WFH' ? 'Working from home' : ''
        });
      }
    }
    await Attendance.insertMany(attEntries);
    console.log(`Seeded ${attEntries.length} attendance records`);

    // --- PAYROLL (with salary breakup) ---
    const salaryData = [
      { u: 0, basic: 100000 }, { u: 1, basic: 62500 }, { u: 2, basic: 83000 },
      { u: 3, basic: 50000 }, { u: 4, basic: 58000 }, { u: 5, basic: 37500 },
      { u: 6, basic: 45000 }, { u: 7, basic: 12500 }
    ];
    const payEntries = [];
    for (const s of salaryData) {
      const hra = Math.round(s.basic * 0.4);
      const da = Math.round(s.basic * 0.1);
      const ta = 1600;
      const special = Math.round(s.basic * 0.15);
      const pfEmp = Math.round(s.basic * 0.12);
      const pfEmr = Math.round(s.basic * 0.12);
      const pt = 200;
      const gross = s.basic + hra + da + ta + special;
      const deductions = pfEmp + pt;
      const net = gross - deductions;
      const ctc = gross + pfEmr;

      // March - PAID
      payEntries.push({
        userId: users[s.u]._id, month: 'March', year: 2026,
        basicSalary: s.basic, hra, da, ta, specialAllowance: special,
        grossSalary: gross, pfEmployee: pfEmp, pfEmployer: pfEmr,
        professionalTax: pt, tds: 0, totalDeductions: deductions,
        netSalary: net, ctc, status: 'PAID', paidDate: new Date('2026-03-28'),
        createdBy: 'admin'
      });
      // April - mix
      const aprilStatus = s.u <= 2 ? 'PROCESSED' : 'PENDING';
      payEntries.push({
        userId: users[s.u]._id, month: 'April', year: 2026,
        basicSalary: s.basic, hra, da, ta, specialAllowance: special,
        grossSalary: gross, pfEmployee: pfEmp, pfEmployer: pfEmr,
        professionalTax: pt, tds: 0, totalDeductions: deductions,
        netSalary: net, ctc, status: aprilStatus, createdBy: 'admin'
      });
    }
    await Payroll.insertMany(payEntries);
    console.log(`Seeded ${payEntries.length} payroll records`);

    // --- UPLOADED FILES ---
    await UploadedFile.insertMany([
      { uploadedBy: 'admin', fileName: 'employee_handbook.pdf', fileType: 'application/pdf', fileSize: 2048576 },
      { uploadedBy: 'priya.hr', fileName: 'leave_policy_2026.csv', fileType: 'text/csv', fileSize: 15360 },
      { uploadedBy: 'rahul.mgr', fileName: 'project_timeline.csv', fileType: 'text/csv', fileSize: 8192 },
      { uploadedBy: 'admin', fileName: 'salary_structure.csv', fileType: 'text/csv', fileSize: 12288 },
      { uploadedBy: 'sneha.dev', fileName: 'meeting_notes.txt', fileType: 'text/plain', fileSize: 4096 }
    ]);
    console.log('Seeded 5 uploaded files');

    // --- MENU ITEMS & PERMISSIONS ---
    const menuItems = await MenuItem.insertMany([
      { name: 'Employee Management' }, { name: 'Role Management' },
      { name: 'Department Management' }, { name: 'Leave Management' },
      { name: 'Project Management' }, { name: 'Documents' }
    ]);
    const menuActions = await MenuAction.insertMany([
      { actionName: 'VIEW', menuItem: menuItems[0]._id }, { actionName: 'CREATE', menuItem: menuItems[0]._id },
      { actionName: 'EDIT', menuItem: menuItems[0]._id }, { actionName: 'DELETE', menuItem: menuItems[0]._id },
      { actionName: 'VIEW', menuItem: menuItems[1]._id }, { actionName: 'CREATE', menuItem: menuItems[1]._id },
      { actionName: 'VIEW', menuItem: menuItems[3]._id }, { actionName: 'APPROVE', menuItem: menuItems[3]._id }
    ]);
    await RoleMenuAction.insertMany([
      { role: roles[0]._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: roles[0]._id, menuItem: menuItems[0]._id, menuAction: menuActions[1]._id, isAllowed: true },
      { role: roles[1]._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: roles[1]._id, menuItem: menuItems[0]._id, menuAction: menuActions[1]._id, isAllowed: true },
      { role: roles[3]._id, menuItem: menuItems[0]._id, menuAction: menuActions[0]._id, isAllowed: true },
      { role: roles[2]._id, menuItem: menuItems[3]._id, menuAction: menuActions[6]._id, isAllowed: true },
      { role: roles[2]._id, menuItem: menuItems[3]._id, menuAction: menuActions[7]._id, isAllowed: true }
    ]);
    console.log('Seeded menu items & permissions');

    console.log('\n--- SEED COMPLETE ---');
    console.log('Org Structure:');
    console.log('  Aaditya (CTO/Admin) → Rahul (Eng Manager) → Sneha, Vikram, Arjun, Amit');
    console.log('  Aaditya → Priya (HR) → Neha (Sales)');
    console.log('\nLogin: any username / password123');
    console.log('  admin, priya.hr, rahul.mgr, sneha.dev, vikram.design, neha.sales, arjun.qa');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
