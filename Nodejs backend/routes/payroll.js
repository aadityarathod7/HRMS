const express = require('express');
const router = express.Router();
const payrollService = require('../services/payrollService');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await payrollService.createPayroll(req.body);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.get('/all', authenticate, async (req, res, next) => {
  try {
    const isAdminOrHR = req.user.roles.some(r => ['ADMIN', 'HR'].includes(r));
    if (isAdminOrHR) {
      const entries = await payrollService.getAllPayrolls();
      return res.json(entries);
    }
    const entries = await payrollService.getPayrollsByUser(req.user.id);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', authenticate, async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByStatus(req.params.status);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/user/:userId', authenticate, async (req, res, next) => {
  try {
    const entries = await payrollService.getPayrollsByUser(req.params.userId);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const entry = await payrollService.getPayrollById(req.params.id);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/update/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const entry = await payrollService.updatePayroll(req.params.id, req.body);
    res.json(entry);
  } catch (error) { next(error); }
});

router.put('/updateStatus/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const entry = await payrollService.updatePayrollStatus(req.params.id, status);
    res.json(entry);
  } catch (error) { next(error); }
});

// GET /payroll/payslip/:id — Generate payslip PDF
router.get('/payslip/:id', authenticate, async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const Payroll = require('../models/Payroll');
    const User = require('../models/User');

    const payroll = await Payroll.findById(req.params.id).populate('userId', 'firstname lastname employeeId email contactNumber department designation bankAccountNumber bankName ifscCode panNumber');
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    await User.populate(payroll, { path: 'userId.department', select: 'departmentName' });

    const emp = payroll.userId;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Payslip_${emp.employeeId}_${payroll.month}_${payroll.year}.pdf`);
    doc.pipe(res);

    const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('SANVII TECHMET PVT LTD', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Deploying Excellence, Delivering Success', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#2563eb').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text(`PAYSLIP — ${payroll.month} ${payroll.year}`, { align: 'center' });
    doc.moveDown(1);

    // Employee Details
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#666').text('EMPLOYEE DETAILS');
    doc.moveDown(0.3);
    const detailsY = doc.y;
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    doc.text(`Name: ${emp.firstname} ${emp.lastname}`, 50, detailsY);
    doc.text(`Employee ID: ${emp.employeeId}`, 300, detailsY);
    doc.text(`Department: ${emp.department?.departmentName || '-'}`, 50, detailsY + 15);
    doc.text(`Designation: ${emp.designation || '-'}`, 300, detailsY + 15);
    doc.text(`PAN: ${emp.panNumber || '-'}`, 50, detailsY + 30);
    doc.text(`Bank: ${emp.bankName || '-'} (${emp.bankAccountNumber || '-'})`, 300, detailsY + 30);
    doc.moveDown(3);

    // Salary Table
    doc.strokeColor('#ddd').lineWidth(0.5);
    const tableTop = doc.y;
    const col1 = 50, col2 = 300, col3 = 400, col4 = 545;

    // Table header
    doc.rect(col1, tableTop, col4 - col1, 20).fill('#f3f4f6').stroke('#ddd');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333');
    doc.text('EARNINGS', col1 + 10, tableTop + 5);
    doc.text('AMOUNT (₹)', col2 - 30, tableTop + 5);
    doc.text('DEDUCTIONS', col2 + 20, tableTop + 5);
    doc.text('AMOUNT (₹)', col4 - 70, tableTop + 5);

    const earnings = [
      ['Basic Salary', payroll.basicSalary],
      ['HRA', payroll.hra],
      ['DA', payroll.da],
      ['Transport Allowance', payroll.ta],
      ['Special Allowance', payroll.specialAllowance],
    ];
    const deductions = [
      ['PF (Employee)', payroll.pfEmployee],
      ['Professional Tax', payroll.professionalTax],
      ['TDS', payroll.tds],
      ['LOP Deduction', payroll.lopDeduction],
    ];

    let rowY = tableTop + 25;
    const maxRows = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows; i++) {
      doc.font('Helvetica').fontSize(9).fillColor('#444');
      if (earnings[i]) {
        doc.text(earnings[i][0], col1 + 10, rowY);
        doc.text(`₹${fmt(earnings[i][1])}`, col2 - 30, rowY);
      }
      if (deductions[i]) {
        doc.text(deductions[i][0], col2 + 20, rowY);
        doc.text(`₹${fmt(deductions[i][1])}`, col4 - 70, rowY);
      }
      rowY += 18;
    }

    // Totals
    rowY += 5;
    doc.strokeColor('#ddd').moveTo(col1, rowY).lineTo(col4, rowY).stroke();
    rowY += 8;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000');
    doc.text('Gross Salary', col1 + 10, rowY);
    doc.text(`₹${fmt(payroll.grossSalary)}`, col2 - 30, rowY);
    doc.text('Total Deductions', col2 + 20, rowY);
    doc.text(`₹${fmt(payroll.totalDeductions)}`, col4 - 70, rowY);

    rowY += 25;
    doc.rect(col1, rowY, col4 - col1, 25).fill('#2563eb');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff');
    doc.text(`NET SALARY: ₹${fmt(payroll.netSalary)}`, col1 + 10, rowY + 6);
    doc.text(`(${payroll.month} ${payroll.year})`, col4 - 120, rowY + 6);

    // Footer
    doc.moveDown(4);
    doc.fontSize(8).font('Helvetica').fillColor('#999');
    doc.text('This is a system-generated payslip and does not require a signature.', 50, doc.y, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });

    doc.end();
  } catch (error) { next(error); }
});

router.delete('/delete/:id', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    await payrollService.deletePayroll(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
