import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";

interface PayrollEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string } | string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
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
  const [form, setForm] = useState({ userId: "", month: "", year: new Date().getFullYear().toString(), basicSalary: "", allowances: "", deductions: "" });
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedStatus === "ALL"
        ? "http://localhost:5000/payroll/all"
        : `http://localhost:5000/payroll/status/${selectedStatus}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setPayrolls(response.data);
    } catch (error) { console.error("Error fetching payrolls:", error); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/user/all", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (error) { console.error("Error fetching users:", error); }
  };

  useEffect(() => { fetchPayrolls(); }, [selectedStatus]);
  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/payroll/create", {
        userId: form.userId,
        month: form.month,
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
        createdBy: localStorage.getItem("username") || "system",
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payroll created");
      setForm({ userId: "", month: "", year: new Date().getFullYear().toString(), basicSalary: "", allowances: "", deductions: "" });
      setShowForm(false);
      fetchPayrolls();
    } catch (error) { toast.error("Failed to create payroll"); }
  };

  const handleProcess = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/payroll/updateStatus/${id}?status=PROCESSED`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Payroll processed");
      fetchPayrolls();
    } catch (error) { toast.error("Failed to process"); }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/payroll/updateStatus/${id}?status=PAID`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Marked as paid");
      fetchPayrolls();
    } catch (error) { toast.error("Failed to update"); }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-blue-50 text-blue-600",
      PROCESSED: "bg-blue-100 text-blue-800",
      PAID: "bg-blue-100 text-blue-700",
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full max-w-6xl transition-all duration-300 ${isCollapsed ? "ml-40" : "ml-80"}`}>
        <div className="p-5 flex-grow">
          <div className="flex justify-end gap-4 mt-24 mb-5">
            <select
              className="bg-blue-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSED">Processed</option>
              <option value="PAID">Paid</option>
            </select>
            {isAdminOrHR && (
              <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition">
                {showForm ? "Cancel" : "Add Payroll"}
              </button>
            )}
          </div>

          {showForm && isAdminOrHR && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-5">
              <h3 className="text-lg font-light text-gray-900 mb-4">Add Payroll Entry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <input type="number" required min="0" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Allowances (INR)</label>
                  <input type="number" min="0" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="10000" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Deductions (INR)</label>
                  <input type="number" min="0" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="5000" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition">Submit</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 font-medium text-gray-700 text-left">Employee</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Month</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Year</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Basic</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Allowances</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Deductions</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Net Salary</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Status</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={9} className="p-5 text-center text-gray-500">Loading...</td></tr>
                ) : payrolls.length === 0 ? (
                  <tr><td colSpan={9} className="p-5 text-center text-gray-500">No payroll records found</td></tr>
                ) : payrolls.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">{typeof entry.userId === 'object' ? `${entry.userId.firstname} ${entry.userId.lastname}` : entry.userId}</td>
                    <td className="p-3 text-gray-600">{entry.month}</td>
                    <td className="p-3 text-gray-600">{entry.year}</td>
                    <td className="p-3 text-gray-600">{formatCurrency(entry.basicSalary)}</td>
                    <td className="p-3 text-green-600">{formatCurrency(entry.allowances)}</td>
                    <td className="p-3 text-red-600">{formatCurrency(entry.deductions)}</td>
                    <td className="p-3 text-gray-900 font-medium">{formatCurrency(entry.netSalary)}</td>
                    <td className="p-3">{getStatusBadge(entry.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {entry.status === "PENDING" && isAdminOrHR && (
                          <button onClick={() => handleProcess(entry.id)} className="text-blue-600 hover:text-blue-800 text-sm">Process</button>
                        )}
                        {entry.status === "PROCESSED" && isAdminOrHR && (
                          <button onClick={() => handleMarkPaid(entry.id)} className="text-green-600 hover:text-green-800 text-sm">Mark Paid</button>
                        )}
                        {entry.status === "PAID" && (
                          <span className="text-gray-400 text-sm">Paid {entry.paidDate ? new Date(entry.paidDate).toLocaleDateString() : ""}</span>
                        )}
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
