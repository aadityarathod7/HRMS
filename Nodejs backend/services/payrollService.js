const Payroll = require('../models/Payroll');

const createPayroll = async (data) => {
  const netSalary = (data.basicSalary || 0) + (data.allowances || 0) - (data.deductions || 0);
  const entry = new Payroll({ ...data, netSalary, createdDate: new Date() });
  return await entry.save();
};

const getAllPayrolls = async () => {
  return await Payroll.find().populate('userId', 'firstname lastname userName').sort({ year: -1, month: -1 });
};

const getPayrollById = async (id) => {
  const entry = await Payroll.findById(id).populate('userId', 'firstname lastname userName');
  if (!entry) throw { status: 404, message: 'Payroll record not found' };
  return entry;
};

const getPayrollsByStatus = async (status) => {
  return await Payroll.find({ status }).populate('userId', 'firstname lastname userName');
};

const getPayrollsByUser = async (userId) => {
  return await Payroll.find({ userId }).sort({ year: -1, month: -1 });
};

const updatePayroll = async (id, data) => {
  const entry = await Payroll.findById(id);
  if (!entry) throw { status: 404, message: 'Payroll record not found' };
  if (data.basicSalary !== undefined || data.allowances !== undefined || data.deductions !== undefined) {
    const basic = data.basicSalary !== undefined ? data.basicSalary : entry.basicSalary;
    const allow = data.allowances !== undefined ? data.allowances : entry.allowances;
    const deduct = data.deductions !== undefined ? data.deductions : entry.deductions;
    data.netSalary = basic + allow - deduct;
  }
  Object.assign(entry, data, { updatedDate: new Date() });
  return await entry.save();
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
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  getPayrollsByStatus,
  getPayrollsByUser,
  updatePayroll,
  updatePayrollStatus,
  deletePayroll
};
