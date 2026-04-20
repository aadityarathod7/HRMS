import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import DateInput from "@/components/DateInput";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AttendanceEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string } | string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

const AttendanceManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [records, setRecords] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", date: "", checkIn: "", checkOut: "", status: "PRESENT", notes: "" });
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedStatus === "ALL"
        ? `${API_URL}/attendance/all`
        : `${API_URL}/attendance/status/${selectedStatus}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRecords(response.data);
    } catch (err) { toast.error("Failed to load attendance records"); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/user/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch { toast.error("Failed to load employees"); }
  };

  useEffect(() => { fetchRecords(); }, [selectedStatus]);
  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      toast.error("Check-out time must be after check-in time");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/attendance/mark`, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Attendance marked");
      setForm({ userId: "", date: "", checkIn: "", checkOut: "", status: "PRESENT", notes: "" });
      setShowForm(false);
      fetchRecords();
    } catch (error) { toast.error("Failed to mark attendance"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/attendance/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Record deleted");
      fetchRecords();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const getStatusBadge = (status: string) => {
    const c: Record<string, { dot: string; bg: string; text: string }> = {
      PRESENT: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
      WFH: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
      ABSENT: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-600" },
      HALF_DAY: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
      ON_LEAVE: { dot: "bg-purple-400", bg: "bg-purple-50", text: "text-purple-700" },
    };
    const s = c[status] || { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600" };
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{status.replace("_", " ")}</span>;
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
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
            {isAdminOrHR && (
              <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
                {showForm ? "Cancel" : "Mark Attendance"}
              </button>
            )}
          </div>

          {showForm && isAdminOrHR && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-5">
              <h3 className="text-lg font-light text-gray-900 mb-4">Mark Attendance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Employee</label>
                  <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Employee</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstname} {u.lastname}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Check In</label>
                  <input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Check Out</label>
                  <input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Optional notes" />
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
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Check In</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Check Out</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Notes</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No attendance records found</td></tr>
                ) : records.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 text-sm">{typeof entry.userId === 'object' ? `${entry.userId.firstname} ${entry.userId.lastname}` : entry.userId}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.checkIn || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.checkOut || "-"}</td>
                    <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.notes || "-"}</td>
                    <td className="px-4 py-3">
                      {isAdminOrHR && <button onClick={() => handleDelete(entry.id)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 transition">Delete</button>}
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

export default AttendanceManagement;
