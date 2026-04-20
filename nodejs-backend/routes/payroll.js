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
    const logoPath    = path.join(__dirname, '../assets/logo.png');
    const fontReg  = path.join(__dirname, '../assets/Inter-Regular.ttf');
    const fontBold = path.join(__dirname, '../assets/Inter-Bold.ttf');
    const fontSemi = path.join(__dirname, '../assets/Inter-SemiBold.ttf');

    // Register Inter fonts
    try { doc.registerFont('I-Regular', fontReg);  } catch(_) {}
    try { doc.registerFont('I-Bold',    fontBold); } catch(_) {}
    try { doc.registerFont('I-Semi',    fontSemi); } catch(_) {}

    // Format currency — use Rs. prefix (built-in fonts don't support ₹ glyph)
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

    // Font helpers — Inter (clean, professional, used by Notion/Linear/Stripe)
    const PR  = (sz) => { try { return doc.font('I-Regular').fontSize(sz); } catch(_) { return doc.font('Helvetica').fontSize(sz); } };
    const PB  = (sz) => { try { return doc.font('I-Bold').fontSize(sz);    } catch(_) { return doc.font('Helvetica-Bold').fontSize(sz); } };
    const PS  = (sz) => { try { return doc.font('I-Semi').fontSize(sz);    } catch(_) { return doc.font('Helvetica').fontSize(sz); } };

    // ── HEADER ───────────────────────────────────────────────────
    doc.rect(0, 0, PG_W, 110).fill('#ffffff');

    // Logo — use fit to constrain the full image (icon + text) into a box
    // The actual S-icon is the top ~60% of the image height
    const LOGO_BOX_H = 48; // total logo image height in PDF
    const LOGO_BOX_W = Math.round(LOGO_BOX_H * 1494 / 871); // ~82px
    const LOGO_Y = 16;
    try {
      doc.image(logoPath, L, LOGO_Y, { fit: [LOGO_BOX_W, LOGO_BOX_H] });
    } catch (_) { /* skip */ }

    // Company name — aligned to top of S-icon (~top 60% of logo box)
    const nameX = L + LOGO_BOX_W + 10;
    const nameAvailW = R - nameX - 175; // leave room for payslip label on right
    PB(17).fillColor('#111827')
      .text('Sanvii Techmet Pvt. Ltd.', nameX, LOGO_Y + 2, { width: nameAvailW });
    PR(7.5).fillColor('#6b7280')
      .text('403, Princes pride, Near Janjeerwala Square,', nameX, LOGO_Y + 24, { width: nameAvailW })
      .text('New Palasia Indore, Madhya Pradesh, 452001 India', nameX, LOGO_Y + 34, { width: nameAvailW });

    // Right: Payslip label
    PR(8).fillColor('#6b7280')
      .text('Payslip For the Month', R - 155, LOGO_Y + 6, { width: 155, align: 'right' });
    PB(16).fillColor('#111827')
      .text(`${payroll.month} ${payroll.year}`, R - 155, LOGO_Y + 20, { width: 155, align: 'right' });

    // Header bottom border
    y = LOGO_Y + LOGO_BOX_H + 10;
    doc.strokeColor('#d1d5db').lineWidth(0.8).moveTo(L, y).lineTo(R, y).stroke();
    y += 12;

    // ── EMPLOYEE SUMMARY ─────────────────────────────────────────
    PS(7.5).fillColor('#9ca3af').text('EMPLOYEE SUMMARY', L, y);
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
      PR(8).fillColor('#6b7280').text(lbl, L, ry, { width: labelW });
      PR(8).fillColor('#374151').text(':', L + labelW, ry);
      PS(8).fillColor('#111827').text(val, valX, ry, { width: 185 });
    });

    // Net Pay box
    const boxX = MID + 35, boxY = summaryY - 4;
    const boxW = R - boxX, boxH = 92;
    doc.roundedRect(boxX, boxY, boxW, boxH, 5).fillAndStroke('#f9fafb', '#e5e7eb');
    doc.rect(boxX, boxY + 5, 4, boxH - 10).fill('#16a34a');

    PB(14).fillColor('#16a34a')
      .text(`Rs.${fmtN(payroll.netSalary)}`, boxX + 12, boxY + 10, { width: boxW - 16, lineBreak: false });
    PR(7.5).fillColor('#6b7280').text('Total Net Pay', boxX + 12, boxY + 30);

    doc.strokeColor('#e5e7eb').lineWidth(0.5)
       .moveTo(boxX + 12, boxY + 44).lineTo(boxX + boxW - 12, boxY + 44).stroke();

    PR(8).fillColor('#6b7280').text('Paid Days', boxX + 12, boxY + 52);
    PS(8).fillColor('#111827').text(`: ${paidDays}`, boxX + 68, boxY + 52);
    PR(8).fillColor('#6b7280').text('LOP Days', boxX + 12, boxY + 66);
    PS(8).fillColor('#111827').text(`: ${payroll.lopDays || 0}`, boxX + 68, boxY + 66);

    y = Math.max(summaryY + summaryRows.length * 17, boxY + boxH) + 10;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EMPLOYEE DETAILS ─────────────────────────────────────────
    const detailPairs = [
      ['PAN',         emp.panNumber || '-',         'Department',   emp.department?.departmentName || '-'],
      ['Designation', emp.designation || '-',       'Date of birth',emp.dob ? new Date(emp.dob).toLocaleDateString('en-GB') : '-'],
      ['Account No.', emp.bankAccountNumber || '-', 'IFSC code',    emp.ifscCode || '-'],
    ];
    const dL1 = L, dL2 = L + 62, dL3 = MID + 10, dL4 = MID + 85;
    detailPairs.forEach(([l1, v1, l2, v2]) => {
      PR(8).fillColor('#6b7280').text(l1, dL1, y, { width: 58 });
      PR(8).fillColor('#374151').text(':', dL2 - 4, y);
      PS(8).fillColor('#111827').text(v1, dL2, y, { width: MID - dL2 - 10 });
      PR(8).fillColor('#6b7280').text(l2, dL3, y, { width: 73 });
      PR(8).fillColor('#374151').text(':', dL4 - 4, y);
      PS(8).fillColor('#111827').text(v2, dL4, y, { width: R - dL4 });
      y += 15;
    });

    y += 4;
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 10;

    // ── EARNINGS & DEDUCTIONS TABLE ──────────────────────────────
    const tMid = MID;
    const ROW_H = 21;
    const AMT_W = 90;
    const eLabel = L + 8;
    const eAmt   = tMid - 8;
    const dLabel = tMid + 10;
    const dAmt   = R - 8;

    const drawVDiv = (fromY, toY) => {
      doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(tMid, fromY).lineTo(tMid, toY).stroke();
    };

    // Table header
    doc.rect(L, y, W, ROW_H).fillAndStroke('#f3f4f6', '#e5e7eb');
    PS(8).fillColor('#374151');
    doc.text('EARNINGS',   eLabel,        y + 7);
    doc.text('AMOUNT',     eAmt - AMT_W,  y + 7, { width: AMT_W, align: 'right' });
    doc.text('DEDUCTIONS', dLabel,        y + 7);
    doc.text('AMOUNT',     dAmt - AMT_W,  y + 7, { width: AMT_W, align: 'right' });
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

      PR(8.5).fillColor('#111827');
      if (earnings[i]) {
        doc.text(earnings[i][0], eLabel, rowY + 7, { width: tMid - eLabel - 10 });
        PS(8.5).fillColor('#111827').text(fmt(earnings[i][1]), eAmt - AMT_W, rowY + 7, { width: AMT_W, align: 'right' });
      }
      if (deductions[i]) {
        PR(8.5).fillColor('#111827').text(deductions[i][0], dLabel, rowY + 7, { width: dAmt - dLabel - 60 });
        PS(8.5).fillColor('#111827').text(fmt(deductions[i][1]), dAmt - AMT_W, rowY + 7, { width: AMT_W, align: 'right' });
      }
    }
    y += maxRows * ROW_H;

    drawVDiv(tableHeaderY, y);
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();

    // Gross Earnings / Total Deductions footer row
    doc.rect(L, y, W, ROW_H + 2).fillAndStroke('#f3f4f6', '#e5e7eb');
    PB(8.5).fillColor('#111827');
    doc.text('Gross Earnings',  eLabel,       y + 7);
    doc.text(fmt(payroll.grossSalary    || 0), eAmt - AMT_W, y + 7, { width: AMT_W, align: 'right' });
    doc.text('Total Deductions', dLabel,       y + 7);
    doc.text(fmt(payroll.totalDeductions|| 0), dAmt - AMT_W, y + 7, { width: AMT_W, align: 'right' });
    drawVDiv(y, y + ROW_H + 2);
    y += ROW_H + 12;

    // ── TOTAL NET PAYABLE ────────────────────────────────────────
    doc.rect(L, y, W, 46).fillAndStroke('#f0fdf4', '#bbf7d0');
    PB(9).fillColor('#111827').text('TOTAL NET PAYABLE', L + 12, y + 8);
    PR(7.5).fillColor('#6b7280').text('Gross Earnings - Total Deductions', L + 12, y + 24);
    PB(13).fillColor('#15803d')
      .text(`Rs.${fmtN(payroll.netSalary || 0)}`, R - 175, y + 15, { width: 163, align: 'right' });
    y += 56;

    // ── AMOUNT IN WORDS ──────────────────────────────────────────
    PR(8).fillColor('#6b7280').text('Amount In Words : ', L, y, { continued: true });
    PB(8).fillColor('#111827')
      .text(`Indian Rupee ${toWords(Math.round(payroll.netSalary || 0))} Only`, { lineBreak: false });
    y += 22;

    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke();
    y += 14;

    // ── FOOTER ───────────────────────────────────────────────────
    PR(8).fillColor('#9ca3af')
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
