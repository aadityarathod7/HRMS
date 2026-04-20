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
    const entries = await payrollService.getPayrollsByUser(req.user.id, false);
    res.json(entries);
  } catch (error) { next(error); }
});

router.get('/status/:status', authenticate, authorize('ADMIN', 'HR'), async (req, res, next) => {
  try {
    const allowed = ['PENDING', 'PROCESSED', 'PAID'];
    if (!allowed.includes(req.params.status)) return res.status(400).json({ message: 'Invalid status' });
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
    const allowed = ['PENDING', 'PROCESSED', 'PAID'];
    if (!status || !allowed.includes(status)) return res.status(400).json({ message: 'Invalid status. Must be PENDING, PROCESSED or PAID' });
    const entry = await payrollService.updatePayrollStatus(req.params.id, status);
    res.json(entry);
  } catch (error) { next(error); }
});

// GET /payroll/payslip/:id — Generate payslip PDF matching Sanvii format
router.get('/payslip/:id', authenticate, async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const Payroll = require('../models/Payroll');
    const User = require('../models/User');

    const payroll = await Payroll.findById(req.params.id)
      .populate('userId', 'firstname lastname employeeId email contactNumber department designation bankAccountNumber bankName ifscCode panNumber dob dateOfJoining');
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    await User.populate(payroll, { path: 'userId.department', select: 'departmentName' });

    const emp = payroll.userId;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Payslip_${emp.employeeId}_${payroll.month}_${payroll.year}.pdf`);
    doc.pipe(res);

    const fmt = (n) => `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;
    const L = 40, R = 555, MID = 297;
    const W = R - L;

    // ── HEADER ──────────────────────────────────────────────────
    // Company name
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a1a')
       .text('Sanvii Techmet Pvt. Ltd.', L, 40);
    // Address
    doc.fontSize(8).font('Helvetica').fillColor('#555')
       .text('403, Princes pride, Near Janjeerwala Square, New Palasia Indore, Madhya Pradesh, 452001 India', L, 62, { width: 300 });
    // Right: Payslip label
    doc.fontSize(9).font('Helvetica').fillColor('#555').text('Payslip For the Month', MID + 60, 40, { align: 'right', width: R - MID - 60 });
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a1a1a').text(`${payroll.month} ${payroll.year}`, MID + 60, 55, { align: 'right', width: R - MID - 60 });

    // Horizontal line
    let y = 95;
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(L, y).lineTo(R, y).stroke();
    y += 12;

    // ── EMPLOYEE SUMMARY ────────────────────────────────────────
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#888').text('EMPLOYEE SUMMARY', L, y);
    y += 14;

    const summaryLeft = [
      ['Employee Name', `${emp.firstname} ${emp.lastname}`],
      ['Employee ID',   emp.employeeId || '-'],
      ['Pay Period',    `${payroll.month} ${payroll.year}`],
      ['Pay Date',      `01/${payroll.month === 'January' ? '01' : String(['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(payroll.month)+1).padStart(2,'0')}/${payroll.year}`],
    ];

    const summaryY = y;
    summaryLeft.forEach(([label, val], i) => {
      const rowY2 = summaryY + i * 16;
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(label, L, rowY2);
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(':', L + 90, rowY2);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a1a1a').text(val, L + 100, rowY2);
    });

    // Net Pay box (right side)
    const boxX = MID + 30, boxW = R - boxX, boxH = 75;
    doc.roundedRect(boxX, summaryY - 4, boxW, boxH, 6).stroke('#e5e7eb');
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#16a34a')
       .text(fmt(payroll.netSalary), boxX + 8, summaryY + 2, { width: boxW - 16 });
    doc.fontSize(8).font('Helvetica').fillColor('#555').text('Total Net Pay', boxX + 8, summaryY + 28);
    // Divider inside box
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(boxX + 8, summaryY + 38).lineTo(boxX + boxW - 8, summaryY + 38).stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#555').text('Paid Days', boxX + 8, summaryY + 44);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a1a1a').text(`: ${payroll.lopDays !== undefined ? (30 - (payroll.lopDays || 0)) : 30}`, boxX + 60, summaryY + 44);
    doc.fontSize(8).font('Helvetica').fillColor('#555').text('LOP Days', boxX + 8, summaryY + 57);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a1a1a').text(`: ${payroll.lopDays || 0}`, boxX + 60, summaryY + 57);

    y = summaryY + 70;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EMPLOYEE DETAILS ROW ─────────────────────────────────────
    const details = [
      ['PAN',         emp.panNumber      || '-', 'Department',  emp.department?.departmentName || '-'],
      ['Designation', emp.designation    || '-', 'Date of birth', emp.dob ? new Date(emp.dob).toLocaleDateString('en-GB') : '-'],
      ['Account No.', emp.bankAccountNumber || '-', 'IFSC code', emp.ifscCode || '-'],
    ];
    details.forEach(([l1, v1, l2, v2]) => {
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(l1, L, y);
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(':', L + 70, y);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a1a1a').text(v1, L + 80, y, { width: 140 });
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(l2, MID, y);
      doc.fontSize(8).font('Helvetica').fillColor('#555').text(':', MID + 80, y);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a1a1a').text(v2, MID + 90, y, { width: 140 });
      y += 14;
    });

    y += 4;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EARNINGS & DEDUCTIONS TABLE ──────────────────────────────
    const tL = L, tMid = MID - 10, tR = R;
    const colELabel = tL, colEAmt = tMid - 80;
    const colDLabel = tMid + 10, colDAmt = tR;

    // Table header
    doc.rect(tL, y, tR - tL, 18).fill('#f9fafb');
    doc.strokeColor('#e5e7eb').rect(tL, y, tR - tL, 18).stroke();
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#666');
    doc.text('EARNINGS', colELabel + 8, y + 5);
    doc.text('AMOUNT', colEAmt - 45, y + 5, { width: 60, align: 'right' });
    doc.text('DEDUCTIONS', colDLabel + 8, y + 5);
    doc.text('AMOUNT', colDAmt - 55, y + 5, { width: 60, align: 'right' });
    y += 18;

    const earnings = [
      ['Basic',               payroll.basicSalary || 0],
      ['House Rent Allowance',payroll.hra || 0],
      ['Dearness Allowance',  payroll.da || 0],
      ['Special Allowance',   payroll.specialAllowance || 0],
    ].filter(([, v]) => v > 0);

    const deductions = [
      ['Income Tax',       payroll.tds || 0],
      ['Provident Fund',   payroll.pfEmployee || 0],
      ['Professional Tax', payroll.professionalTax || 0],
      ...(payroll.lopDeduction > 0 ? [['LOP Deduction', payroll.lopDeduction]] : []),
    ];

    const maxRows = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows; i++) {
      doc.strokeColor('#f3f4f6').lineWidth(0.5).moveTo(tL, y).lineTo(tR, y).stroke();
      doc.fontSize(8.5).font('Helvetica').fillColor('#1a1a1a');
      if (earnings[i]) {
        doc.text(earnings[i][0], colELabel + 8, y + 4);
        doc.text(fmt(earnings[i][1]), colEAmt - 45, y + 4, { width: 60, align: 'right' });
      }
      if (deductions[i]) {
        doc.text(deductions[i][0], colDLabel + 8, y + 4);
        doc.text(fmt(deductions[i][1]), colDAmt - 55, y + 4, { width: 60, align: 'right' });
      }
      y += 18;
    }

    // Gross / Total Deductions row
    doc.rect(tL, y, tR - tL, 20).fill('#f3f4f6').stroke('#e5e7eb');
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1a1a1a');
    doc.text('Gross Earnings', colELabel + 8, y + 5);
    doc.text(fmt(payroll.grossSalary), colEAmt - 45, y + 5, { width: 60, align: 'right' });
    doc.text('Total Deductions', colDLabel + 8, y + 5);
    doc.text(fmt(payroll.totalDeductions), colDAmt - 55, y + 5, { width: 60, align: 'right' });
    y += 28;

    // ── TOTAL NET PAYABLE ────────────────────────────────────────
    doc.rect(tL, y, tR - tL, 40).fill('#f0fdf4').stroke('#86efac');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a1a1a').text('TOTAL NET PAYABLE', tL + 10, y + 6);
    doc.fontSize(8).font('Helvetica').fillColor('#555').text('Gross Earnings - Total Deductions', tL + 10, y + 20);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text(fmt(payroll.netSalary), tR - 130, y + 10, { width: 120, align: 'right' });
    y += 50;

    // Amount in words
    const toWords = (n) => {
      const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      if (n === 0) return 'Zero';
      const convert = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
        if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' ' + convert(num%100) : '');
        if (num < 100000) return convert(Math.floor(num/1000)) + ' Thousand' + (num%1000 ? ' ' + convert(num%1000) : '');
        if (num < 10000000) return convert(Math.floor(num/100000)) + ' Lakh' + (num%100000 ? ' ' + convert(num%100000) : '');
        return convert(Math.floor(num/10000000)) + ' Crore' + (num%10000000 ? ' ' + convert(num%10000000) : '');
      };
      return convert(Math.round(n));
    };

    doc.fontSize(8).font('Helvetica').fillColor('#555')
       .text(`Amount In Words : Indian Rupee ${toWords(Math.round(payroll.netSalary))} Only`, tL, y, { align: 'right', width: W });
    y += 20;

    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 14;

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#aaa')
       .text('-- This is a system-generated document. --', L, y, { align: 'center', width: W });

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
