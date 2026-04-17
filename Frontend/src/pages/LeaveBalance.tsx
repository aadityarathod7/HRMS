import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

ChartJS.register(ArcElement, Tooltip, Legend);

const LEAVE_TYPES = ["CASUAL", "SICK", "PRIVILEGE", "COMP_OFF", "MATERNITY", "PATERNITY"];
const COLORS = ["rgba(37,99,235,0.7)", "rgba(59,130,246,0.7)", "rgba(96,165,250,0.7)", "rgba(147,197,253,0.7)", "rgba(191,219,254,0.7)", "rgba(30,64,175,0.7)"];

const LeaveBalance: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [allBalances, setAllBalances] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: "", leaveType: "CASUAL", totalAllotted: "12" });
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = roles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchMyBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = userProfile.id;
      if (!userId) { setLoading(false); return; }
      const res = await axios.get(`${API_URL}/leaverequests/balance/${userId}?year=${new Date().getFullYear()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalances(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchAllBalances = async () => {
    if (!isAdminOrHR) return;
    try {
      const token = localStorage.getItem("token");
      const [balRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/leaverequests/balance/all/${new Date().getFullYear()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/user/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAllBalances(balRes.data);
      setUsers(userRes.data);
    } catch (err) {}
  };

  useEffect(() => { fetchMyBalance(); fetchAllBalances(); }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/leaverequests/balance/update`, {
        userId: assignForm.userId,
        leaveType: assignForm.leaveType,
        totalAllotted: Number(assignForm.totalAllotted),
        year: new Date().getFullYear(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Leave balance updated");
      setAssignForm({ userId: "", leaveType: "CASUAL", totalAllotted: "12" });
      setShowAssign(false);
      fetchAllBalances();
      fetchMyBalance();
    } catch (err) { toast.error("Failed to update leave balance"); }
  };

  // Group all balances by employee
  const groupedBalances = allBalances.reduce((acc: any, b: any) => {
    const key = b.userId?._id || b.userId;
    if (!acc[key]) acc[key] = { employee: b.userId, leaves: [] };
    acc[key].leaves.push(b);
    return acc;
  }, {});

  const chartData = {
    labels: balances.map(b => b.leaveType),
    datasets: [{ data: balances.map(b => b.available), backgroundColor: COLORS.slice(0, balances.length), borderWidth: 0 }],
  };

  const totalAllotted = balances.reduce((s, b) => s + b.totalAllotted, 0);
  const totalUsed = balances.reduce((s, b) => s + b.used, 0);
  const totalAvailable = balances.reduce((s, b) => s + b.available, 0);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-900">Leave Balance — {userProfile.firstname} {userProfile.lastname}</h2>
            {isAdminOrHR && (
              <button onClick={() => setShowAssign(!showAssign)} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
                {showAssign ? "Cancel" : "Assign Leaves"}
              </button>
            )}
          </div>

          {/* Assign Leave Form (HR/Admin) */}
          {showAssign && isAdminOrHR && (
            <form onSubmit={handleAssign} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Assign Leave Balance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Employee</label>
                  <select required value={assignForm.userId} onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Employee</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstname} {u.lastname} ({u.employeeId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Leave Type</label>
                  <select required value={assignForm.leaveType} onChange={(e) => setAssignForm({ ...assignForm, leaveType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Total Days</label>
                  <input type="number" required min="0" value={assignForm.totalAllotted} onChange={(e) => setAssignForm({ ...assignForm, totalAllotted: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm h-[38px]">Assign</button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <>
              {/* My Balance */}
              {balances.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Allotted</p>
                      <p className="text-2xl font-light text-gray-900 mt-1">{totalAllotted}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Used</p>
                      <p className="text-2xl font-light text-gray-900 mt-1">{totalUsed}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Available</p>
                      <p className="text-2xl font-light text-blue-600 mt-1">{totalAvailable}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Leave Type</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Allotted</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Used</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Available</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {balances.map((b: any) => (
                            <tr key={b.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-800">{b.leaveType}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{b.totalAllotted}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{b.used}</td>
                              <td className="px-4 py-3 text-sm font-medium text-blue-600">{b.available}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center shadow-sm">
                      <div style={{ width: "250px", height: "250px" }}>
                        <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { padding: 16, font: { size: 12 } } } } }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {balances.length === 0 && !isAdminOrHR && (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm mb-6">
                  <p className="text-gray-500">No leave balance found for {new Date().getFullYear()}.</p>
                  <p className="text-sm text-gray-400 mt-1">Please contact HR to assign your leave balance.</p>
                </div>
              )}

              {/* All Employees' Balance (HR/Admin) */}
              {isAdminOrHR && Object.keys(groupedBalances).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider">All Employees — Leave Balance {new Date().getFullYear()}</h3>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Employee</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Emp ID</th>
                        {LEAVE_TYPES.slice(0, 3).map(t => (
                          <th key={t} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.values(groupedBalances).map((group: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {group.employee?.firstname} {group.employee?.lastname}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{group.employee?.employeeId}</td>
                          {LEAVE_TYPES.slice(0, 3).map(t => {
                            const lb = group.leaves.find((l: any) => l.leaveType === t);
                            return (
                              <td key={t} className="px-4 py-3 text-sm">
                                {lb ? (
                                  <span className="text-blue-600 font-medium">{lb.available}</span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                                {lb && <span className="text-gray-400 text-xs ml-1">/ {lb.totalAllotted}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LeaveBalance;
