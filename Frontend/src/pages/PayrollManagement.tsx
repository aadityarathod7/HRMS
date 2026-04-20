import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PayrollEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string } | string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  da: number;
  ta: number;
  specialAllowance: number;
  grossSalary: number;
  pfEmployee: number;
  professionalTax: number;
  tds: number;
  lopDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  paidDate: string | null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PayrollManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", month: "", year: new Date().getFullYear().toString(), basicSalary: "", specialAllowance: "", lopDeduction: "", tds: "" });
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchPayrolls = async (status = selectedStatus) => {
    try {
      const token = localStorage.getItem("token");
      const url = status === "ALL"
        ? `${API_URL}/payroll/all`
        : `${API_URL}/payroll/status/${status}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setPayrolls(response.data);
    } catch (err) { toast.error("Failed to load payroll records"); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/user/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch { toast.error("Failed to load employees"); }
  };

  useEffect(() => { fetchPayrolls(); }, [selectedStatus]);
  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/payroll/create`, {
        userId: form.userId,
        month: form.month,
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        specialAllowance: Number(form.specialAllowance) || 0,
        lopDeduction: Number(form.lopDeduction) || 0,
        tds: Number(form.tds) || 0,
        createdBy: localStorage.getItem("username") || "system",
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payroll created");
      setForm({ userId: "", month: "", year: new Date().getFullYear().toString(), basicSalary: "", specialAllowance: "", lopDeduction: "", tds: "" });
      setShowForm(false);
      fetchPayrolls();
    } catch (error: any) { toast.error(error?.response?.data?.message || "Failed to create payroll"); }
  };

  const handleProcess = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/payroll/updateStatus/${id}?status=PROCESSED`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payroll processed");
      fetchPayrolls(selectedStatus);
    } catch (error) { toast.error("Failed to process"); }
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/payroll/payslip/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Payslip downloaded");
    } catch (error) { toast.error("Failed to download payslip"); }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/payroll/updateStatus/${id}?status=PAID`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Marked as paid");
      fetchPayrolls(selectedStatus);
    } catch (error) { toast.error("Failed to update"); }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const c: Record<string, { dot: string; bg: string; text: string }> = {
      PENDING: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
      PROCESSED: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
      PAID: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    };
    const s = c[status] || { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600" };
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{status}</span>;
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">
          <div className="flex justify-end gap-4 mb-5">
            <select
              className="border border-blue-600 text-blue-600 bg-white px-5 py-2 rounded-md appearance-none pr-10 hover:bg-blue-50 transition text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSED">Processed</option>
              <option value="PAID">Paid</option>
            </select>
            {isAdminOrHR && (
              <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
                {showForm ? "Cancel" : "Add Payroll"}
              </button>
            )}
          </div>

          {showForm && isAdminOrHR && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-5">
              <h3 className="text-lg font-light text-gray-900 mb-4">Add Payroll Entry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Employee</label>
                  <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Employee</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstname} {u.lastname}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Month</label>
                  <select required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Month</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Year</label>
                  <input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Basic Salary (INR)</label>
                  <input type="number" required min="0" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="15000" />
                  <p className="text-[10px] text-gray-400 mt-0.5">HRA 40% + DA 20% + Special 40% auto-calculated · PF = 12.5% of Gross · PT = ₹167</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Special Allowance (INR)</label>
                  <input type="number" min="0" value={form.specialAllowance} onChange={(e) => setForm({ ...form, specialAllowance: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">LOP Deduction (INR)</label>
                  <input type="number" min="0" value={form.lopDeduction} onChange={(e) => setForm({ ...form, lopDeduction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">TDS (INR)</label>
                  <input type="number" min="0" value={form.tds} onChange={(e) => setForm({ ...form, tds: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">Submit</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Employee</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Month</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Year</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Basic</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Allowances</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Deductions</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Net Salary</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : payrolls.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">No payroll records found</td></tr>
                ) : payrolls.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 text-sm">{typeof entry.userId === 'object' ? `${entry.userId.firstname} ${entry.userId.lastname}` : entry.userId}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.month}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.year}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{formatCurrency(entry.basicSalary)}</td>
                    <td className="px-4 py-3 text-green-600 text-sm">{formatCurrency((entry.hra || 0) + (entry.da || 0) + (entry.ta || 0) + (entry.specialAllowance || 0))}</td>
                    <td className="px-4 py-3 text-red-500 text-sm">{formatCurrency(entry.totalDeductions || 0)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-sm">{formatCurrency(entry.netSalary)}</td>
                    <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {entry.status === "PENDING" && isAdminOrHR && (
                          <button onClick={() => handleProcess(entry.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500 transition">Process</button>
                        )}
                        {entry.status === "PROCESSED" && isAdminOrHR && (
                          <button onClick={() => handleMarkPaid(entry.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500 transition">Mark Paid</button>
                        )}
                        {entry.status === "PAID" && (
                          <span className="text-gray-400 text-xs">Paid {entry.paidDate ? new Date(entry.paidDate).toLocaleDateString('en-GB') : ""}</span>
                        )}
                        <button onClick={() => handleDownloadPayslip(entry.id)} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition" title="Download Payslip">
                          <Download size={12} /> Payslip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default PayrollManagement;
