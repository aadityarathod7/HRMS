const express = require('express');
const path = require('path');
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
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Payslip_${emp.employeeId}_${payroll.month}_${payroll.year}.pdf`);
    doc.pipe(res);

    // ── HELPERS ─────────────────────────────────────────────────
    const logoPath = path.join(__dirname, '../assets/logo.png');

    // Format currency — use Rs. prefix (Helvetica doesn't support ₹ glyph)
    const fmtN = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
    const fmt  = (n) => `Rs.${fmtN(n)}`;

    // Number to words
    const toWords = (n) => {
      const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      if (!n || n === 0) return 'Zero';
      const convert = (num) => {
        if (num < 20)       return ones[num];
        if (num < 100)      return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '');
        if (num < 1000)     return ones[Math.floor(num/100)]+' Hundred'+(num%100?' '+convert(num%100):'');
        if (num < 100000)   return convert(Math.floor(num/1000))+' Thousand'+(num%1000?' '+convert(num%1000):'');
        if (num < 10000000) return convert(Math.floor(num/100000))+' Lakh'+(num%100000?' '+convert(num%100000):'');
        return convert(Math.floor(num/10000000))+' Crore'+(num%10000000?' '+convert(num%10000000):'');
      };
      return convert(Math.round(n));
    };

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthNum = String(MONTHS.indexOf(payroll.month) + 1).padStart(2,'0');
    const payDate  = `01/${monthNum}/${payroll.year}`;
    const paidDays = 30 - (payroll.lopDays || 0);

    // Layout constants
    const PG_W = 595;
    const L = 36, R = PG_W - 36, W = R - L;
    const MID = L + Math.floor(W / 2);
    let y = 0;

    // ── HEADER ───────────────────────────────────────────────────
    doc.rect(0, 0, PG_W, 100).fill('#ffffff');

    // Logo — top left, small
    try {
      doc.image(logoPath, L, 16, { height: 32 });
    } catch (_) { /* skip */ }

    // Company name — starts at fixed X past logo
    const nameX = L + 68;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827')
       .text('Sanvii Techmet Pvt. Ltd.', nameX, 18);

    // Address — two short lines below company name
    doc.fontSize(6.5).font('Helvetica').fillColor('#6b7280')
       .text('403, Princes pride, Near Janjeerwala Square,', nameX, 37)
       .text('New Palasia Indore, Madhya Pradesh, 452001 India', nameX, 47);

    // Right: Payslip label + month
    const rightX = R - 160;
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
       .text('Payslip For the Month', rightX, 18, { width: 160, align: 'right' });
    doc.fontSize(15).font('Helvetica-Bold').fillColor('#111827')
       .text(`${payroll.month} ${payroll.year}`, rightX, 33, { width: 160, align: 'right' });

    // Header bottom border
    y = 68;
    doc.strokeColor('#d1d5db').lineWidth(0.8).moveTo(L, y).lineTo(R, y).stroke();
    y += 12;

    // ── EMPLOYEE SUMMARY SECTION ─────────────────────────────────
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#6b7280')
       .text('EMPLOYEE SUMMARY', L, y);
    y += 12;

    const summaryY = y;
    const labelW = 95, valX = L + labelW + 6;

    const summaryRows = [
      ['Employee Name', `${emp.firstname} ${emp.lastname}`],
      ['Employee ID',   emp.employeeId || '-'],
      ['Pay Period',    `${payroll.month} ${payroll.year}`],
      ['Pay Date',      payDate],
    ];
    summaryRows.forEach(([lbl, val], i) => {
      const ry = summaryY + i * 17;
      doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text(lbl, L, ry, { width: labelW });
      doc.fontSize(8).font('Helvetica').fillColor('#374151').text(':', L + labelW, ry);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827').text(val, valX, ry, { width: 180 });
    });

    // Net Pay box
    const boxX = MID + 40, boxY = summaryY - 4;
    const boxW = R - boxX, boxH = 90;
    doc.roundedRect(boxX, boxY, boxW, boxH, 5).fillAndStroke('#f9fafb', '#e5e7eb');

    // Green left accent bar — inset by border-radius (5px) top & bottom to avoid overflow
    doc.rect(boxX, boxY + 5, 4, boxH - 10).fill('#16a34a');

    // Amount — font 14 so it fits on one line always
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a')
       .text(`Rs.${fmtN(payroll.netSalary)}`, boxX + 10, boxY + 10, { width: boxW - 14, lineBreak: false });

    // "Total Net Pay" label right below amount
    doc.fontSize(7.5).font('Helvetica').fillColor('#6b7280')
       .text('Total Net Pay', boxX + 10, boxY + 30);

    // Divider
    doc.strokeColor('#e5e7eb').lineWidth(0.5)
       .moveTo(boxX + 10, boxY + 44).lineTo(boxX + boxW - 10, boxY + 44).stroke();

    // Paid Days / LOP Days
    doc.fontSize(7.5).font('Helvetica').fillColor('#6b7280')
       .text('Paid Days', boxX + 10, boxY + 52);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#111827')
       .text(`: ${paidDays}`, boxX + 65, boxY + 52);
    doc.fontSize(7.5).font('Helvetica').fillColor('#6b7280')
       .text('LOP Days', boxX + 10, boxY + 66);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#111827')
       .text(`: ${payroll.lopDays || 0}`, boxX + 65, boxY + 66);

    // Move y past whichever is taller — summary rows or net pay box
    y = Math.max(summaryY + summaryRows.length * 17, boxY + boxH) + 10;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EMPLOYEE DETAILS ─────────────────────────────────────────
    const detailPairs = [
      ['PAN',         emp.panNumber || '-',         'Department',   emp.department?.departmentName || '-'],
      ['Designation', emp.designation || '-',       'Date of birth',emp.dob ? new Date(emp.dob).toLocaleDateString('en-GB') : '-'],
      ['Account No.', emp.bankAccountNumber || '-', 'IFSC code',    emp.ifscCode || '-'],
    ];
    const dL1 = L, dL2 = L + 62, dL3 = MID + 10, dL4 = MID + 82;
    detailPairs.forEach(([l1, v1, l2, v2]) => {
      doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text(l1, dL1, y, { width: 58 });
      doc.fontSize(8).font('Helvetica').fillColor('#374151').text(':', dL2 - 4, y);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827').text(v1, dL2, y, { width: MID - dL2 - 10 });
      doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text(l2, dL3, y, { width: 70 });
      doc.fontSize(8).font('Helvetica').fillColor('#374151').text(':', dL4 - 4, y);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827').text(v2, dL4, y, { width: R - dL4 });
      y += 15;
    });

    y += 4;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EARNINGS & DEDUCTIONS TABLE ──────────────────────────────
    const tMid = MID;
    const ROW_H = 20;

    // Table column positions
    const AMT_W  = 90;           // width for amount column
    const eLabel = L + 8;
    const eAmt   = tMid - 8;    // right edge of earnings amount
    const dLabel = tMid + 10;
    const dAmt   = R - 8;       // right edge of deductions amount

    // Vertical divider between earnings and deductions
    const drawVDiv = (fromY, toY) => {
      doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(tMid, fromY).lineTo(tMid, toY).stroke();
    };

    // Header row
    doc.rect(L, y, W, ROW_H).fillAndStroke('#f3f4f6', '#e5e7eb');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#374151');
    doc.text('EARNINGS', eLabel, y + 6);
    doc.text('AMOUNT', eAmt - AMT_W, y + 6, { width: AMT_W, align: 'right' });
    doc.text('DEDUCTIONS', dLabel, y + 6);
    doc.text('AMOUNT', dAmt - AMT_W, y + 6, { width: AMT_W, align: 'right' });
    const tableHeaderY = y;
    y += ROW_H;

    const earnings = [
      ['Basic',                payroll.basicSalary    || 0],
      ['House Rent Allowance', payroll.hra             || 0],
      ['Dearness Allowance',   payroll.da              || 0],
      ['Special Allowance',    payroll.specialAllowance|| 0],
    ].filter(([, v]) => v > 0);

    const deductions = [
      ['Income Tax',       payroll.tds             || 0],
      ['Provident Fund',   payroll.pfEmployee      || 0],
      ['Professional Tax', payroll.professionalTax || 0],
      ...(payroll.lopDeduction > 0 ? [['LOP Deduction', payroll.lopDeduction]] : []),
    ];

    const maxRows = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows; i++) {
      const rowY = y + i * ROW_H;
      // Alternate row background
      if (i % 2 === 0) doc.rect(L, rowY, W, ROW_H).fill('#fafafa');
      doc.strokeColor('#f3f4f6').lineWidth(0.3).moveTo(L, rowY).lineTo(R, rowY).stroke();

      doc.fontSize(8.5).font('Helvetica').fillColor('#111827');
      if (earnings[i]) {
        doc.text(earnings[i][0], eLabel, rowY + 6, { width: tMid - eLabel - 10 });
        doc.text(fmt(earnings[i][1]), eAmt - AMT_W, rowY + 6, { width: AMT_W, align: 'right' });
      }
      if (deductions[i]) {
        doc.text(deductions[i][0], dLabel, rowY + 6, { width: dAmt - dLabel - 60 });
        doc.text(fmt(deductions[i][1]), dAmt - AMT_W, rowY + 6, { width: AMT_W, align: 'right' });
      }
    }
    y += maxRows * ROW_H;

    drawVDiv(tableHeaderY, y);
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();

    // Gross Earnings / Total Deductions footer row
    doc.rect(L, y, W, ROW_H + 2).fillAndStroke('#f3f4f6', '#e5e7eb');
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Gross Earnings', eLabel, y + 6);
    doc.text(fmt(payroll.grossSalary || 0), eAmt - AMT_W, y + 6, { width: AMT_W, align: 'right' });
    doc.text('Total Deductions', dLabel, y + 6);
    doc.text(fmt(payroll.totalDeductions || 0), dAmt - AMT_W, y + 6, { width: AMT_W, align: 'right' });
    drawVDiv(y, y + ROW_H + 2);
    y += ROW_H + 12;

    // ── TOTAL NET PAYABLE ────────────────────────────────────────
    doc.rect(L, y, W, 44).fillAndStroke('#f0fdf4', '#bbf7d0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827')
       .text('TOTAL NET PAYABLE', L + 12, y + 8);
    doc.fontSize(7.5).font('Helvetica').fillColor('#6b7280')
       .text('Gross Earnings - Total Deductions', L + 12, y + 24);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#15803d')
       .text(`Rs.${fmtN(payroll.netSalary || 0)}`, R - 170, y + 14, { width: 158, align: 'right' });
    y += 54;

    // ── AMOUNT IN WORDS ──────────────────────────────────────────
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text('Amount In Words : ', L, y, { continued: true });
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#111827')
       .text(`Indian Rupee ${toWords(Math.round(payroll.netSalary || 0))} Only`, { lineBreak: false });
    y += 22;

    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 14;

    // ── FOOTER ───────────────────────────────────────────────────
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
       .text('-- This is a system-generated document. --', L, y, { width: W, align: 'center' });

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
