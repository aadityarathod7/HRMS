const Payroll = require('../models/Payroll');

const createPayroll = async (data) => {
  const basic   = data.basicSalary || 0;
  const hra     = data.hra     !== undefined ? data.hra     : Math.round(basic * 0.40); // 40% of Basic
  const da      = data.da      !== undefined ? data.da      : Math.round(basic * 0.20); // 20% of Basic
  const special = data.specialAllowance !== undefined ? data.specialAllowance : Math.round(basic * 0.40); // 40% of Basic
  const ta      = 0; // No TA in this format

  const grossSalary = basic + hra + da + special + ta;

  const pfEmployee    = data.pfEmployee    !== undefined ? data.pfEmployee    : Math.round(grossSalary * 0.125); // 12.5% of Gross
  const pfEmployer    = data.pfEmployer    !== undefined ? data.pfEmployer    : Math.round(grossSalary * 0.125);
  const professionalTax = data.professionalTax !== undefined ? data.professionalTax : 167; // ₹167/month (MP slab)
  const tds           = data.tds           !== undefined ? data.tds           : 0;          // Income Tax
  const lopDeduction  = data.lopDeduction  !== undefined ? data.lopDeduction  : 0;

  const entry = new Payroll({
    ...data,
    basicSalary: basic,
    hra, da, ta, specialAllowance: special,
    pfEmployee, pfEmployer,
    professionalTax, tds, lopDeduction,
    createdDate: new Date()
  });

  return await entry.save();
};

const getAllPayrolls = async () => {
  return await Payroll.find()
    .populate('userId', 'firstname lastname employeeId department designation')
    .sort({ year: -1, month: -1 });
};

const getPayrollById = async (id) => {
  const entry = await Payroll.findById(id).populate('userId', 'firstname lastname employeeId');
  if (!entry) throw { status: 404, message: 'Payroll record not found' };
  return entry;
};

const getPayrollsByStatus = async (status) => {
  return await Payroll.find({ status }).populate('userId', 'firstname lastname employeeId');
};

const getPayrollsByUser = async (userId, includeAll = false) => {
  const filter = includeAll ? { userId } : { userId, status: 'PAID' };
  return await Payroll.find(filter)
    .populate('userId', 'firstname lastname employeeId')
    .sort({ year: -1, month: -1 });
};

const updatePayroll = async (id, data) => {
  const entry = await Payroll.findById(id);
  if (!entry) throw { status: 404, message: 'Payroll record not found' };

  const fields = ['basicSalary', 'hra', 'da', 'ta', 'specialAllowance', 'pfEmployee', 'pfEmployer',
    'professionalTax', 'tds', 'lopDays', 'lopDeduction', 'ctc', 'month', 'year'];
  fields.forEach(f => { if (data[f] !== undefined) entry[f] = data[f]; });
  entry.updatedDate = new Date();

  return await entry.save(); // pre-save hook recalculates gross/net
};

const updatePayrollStatus = async (id, status) => {
  const entry = await Payroll.findById(id);
  if (!entry) throw { status: 404, message: 'Payroll record not found' };
  entry.status = status;
  entry.updatedDate = new Date();
  if (status === 'PAID') entry.paidDate = new Date();
  return await entry.save();
};

const deletePayroll = async (id) => {
  const result = await Payroll.findByIdAndDelete(id);
  if (!result) throw { status: 404, message: 'Payroll record not found' };
};

module.exports = {
  createPayroll, getAllPayrolls, getPayrollById,
  getPayrollsByStatus, getPayrollsByUser,
  updatePayroll, updatePayrollStatus, deletePayroll
};
