import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";

interface PayrollEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string };
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paidDate: string | null;
}

const PayrollManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedStatus === "ALL"
        ? "http://localhost:5000/payroll/all"
        : `http://localhost:5000/payroll/status/${selectedStatus}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayrolls(response.data);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayrolls(); }, [selectedStatus]);

  const handleProcess = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/payroll/updateStatus/${id}?status=PROCESSED`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Payroll processed");
      fetchPayrolls();
    } catch (error) { toast.error("Failed to process"); }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/payroll/updateStatus/${id}?status=PAID`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Marked as paid");
      fetchPayrolls();
    } catch (error) { toast.error("Failed to update"); }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSED: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
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
          </div>
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
                    <td className="p-3 text-gray-700">{entry.userId?.firstname} {entry.userId?.lastname}</td>
                    <td className="p-3 text-gray-600">{entry.month}</td>
                    <td className="p-3 text-gray-600">{entry.year}</td>
                    <td className="p-3 text-gray-600">{formatCurrency(entry.basicSalary)}</td>
                    <td className="p-3 text-green-600">{formatCurrency(entry.allowances)}</td>
                    <td className="p-3 text-red-600">{formatCurrency(entry.deductions)}</td>
                    <td className="p-3 text-gray-900 font-medium">{formatCurrency(entry.netSalary)}</td>
                    <td className="p-3">{getStatusBadge(entry.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {entry.status === "PENDING" && (
                          <button onClick={() => handleProcess(entry.id)} className="text-blue-600 hover:text-blue-800 text-sm">Process</button>
                        )}
                        {entry.status === "PROCESSED" && (
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
