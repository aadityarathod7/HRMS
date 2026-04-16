import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import DateInput from "@/components/DateInput";
import { CheckCircle, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

interface TimesheetEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string } | string;
  date: string;
  hoursWorked: number;
  project: { name: string; projectId: string } | string | null;
  taskDescription: string;
  status: string;
}

const TimeSheetManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", date: "", hoursWorked: "", project: "", taskDescription: "" });
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchTimesheets = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedStatus === "ALL"
        ? "http://localhost:5000/timesheets/all"
        : `http://localhost:5000/timesheets/status/${selectedStatus}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setTimesheets(response.data);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    } finally { setLoading(false); }
  };

  const fetchUsersAndProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const [usersRes, projectsRes] = await Promise.all([
        axios.get("http://localhost:5000/user/all", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/project/all", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) { console.error("Error fetching data:", error); }
  };

  useEffect(() => { fetchTimesheets(); }, [selectedStatus]);
  useEffect(() => { fetchUsersAndProjects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/timesheets/create", {
        userId: form.userId,
        date: form.date,
        hoursWorked: Number(form.hoursWorked),
        project: form.project || undefined,
        taskDescription: form.taskDescription,
        createdBy: localStorage.getItem("username") || "system",
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Timesheet added");
      setForm({ userId: "", date: "", hoursWorked: "", project: "", taskDescription: "" });
      setShowForm(false);
      fetchTimesheets();
    } catch (error) { toast.error("Failed to add timesheet"); }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/timesheets/updateStatus/${id}?status=APPROVED`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Timesheet approved");
      fetchTimesheets();
    } catch (error) { toast.error("Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/timesheets/updateStatus/${id}?status=REJECTED`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Timesheet rejected");
      fetchTimesheets();
    } catch (error) { toast.error("Failed to reject"); }
  };

  const getStatusBadge = (status: string) => {
    const c: Record<string, { dot: string; bg: string; text: string }> = {
      PENDING: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
      APPROVED: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
      REJECTED: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-600" },
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
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {isAdminOrHR && (
              <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
                {showForm ? "Cancel" : "Add Timesheet"}
              </button>
            )}
          </div>

          {showForm && isAdminOrHR && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-5">
              <h3 className="text-lg font-light text-gray-900 mb-4">Add Timesheet Entry</h3>
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
                  <label className="block text-sm text-gray-600 mb-1">Hours Worked</label>
                  <input type="number" required min="0" max="24" step="0.5" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="8" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Project</label>
                  <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Project</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Task Description</label>
                  <input type="text" value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="What did you work on?" />
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
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Project</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Hours</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Task</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : timesheets.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No timesheet entries found</td></tr>
                ) : timesheets.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 text-sm">{typeof entry.userId === 'object' ? `${entry.userId.firstname} ${entry.userId.lastname}` : entry.userId}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{typeof entry.project === 'object' && entry.project ? entry.project.name : "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.hoursWorked}h</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{entry.taskDescription || "-"}</td>
                    <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                    <td className="px-4 py-3">
                      {entry.status === "PENDING" && isAdminOrHR && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(entry.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500 transition">Approve</button>
                          <button onClick={() => handleReject(entry.id)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 transition">Reject</button>
                        </div>
                      )}
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

export default TimeSheetManagement;
