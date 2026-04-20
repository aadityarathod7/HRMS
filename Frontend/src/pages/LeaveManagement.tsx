import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type LeaveDto = {
  id: string;
  userId: any;
  reportingManagerId: any;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: string;
  leaveStatus: string;
  numberOfDays: number;
  description?: string;
  rejectionReason?: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
};

const LeaveManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [leaves, setLeaves] = useState<LeaveDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchLeaves = async (status = selectedStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = status === "APPROVED"
        ? `${API_URL}/leaverequests/approved`
        : status === "REJECTED"
        ? `${API_URL}/leaverequests/rejected`
        : `${API_URL}/leaverequests/pending`;
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      setLeaves(res.data || []);
    } catch {
      toast.error("Failed to load leave requests");
      setLeaves([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(selectedStatus); }, [selectedStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    // useEffect will trigger fetchLeaves with the new status
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/leaverequests/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Leave approved");
      fetchLeaves(selectedStatus);
    } catch { toast.error("Failed to approve leave"); }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (leave blank for default):");
    if (reason === null) return; // user clicked Cancel
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/leaverequests/reject/${id}`, { rejectionReason: reason || "" }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Leave rejected");
      fetchLeaves(selectedStatus);
    } catch { toast.error("Failed to reject leave"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this leave request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/leaverequests/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Leave request deleted");
      setLeaves(prev => prev.filter(l => l.id !== id));
    } catch { toast.error("Failed to delete leave request"); }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Leave Management</h1>
              <p className="text-sm text-gray-400 mt-1">Review and manage employee leave requests</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Link to="/leave-balance">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition text-sm">
                  Leave Balance
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Employee</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Period</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Days</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>
                ) : leaves.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No {selectedStatus.toLowerCase()} leave requests</td></tr>
                ) : leaves.map((leave, index) => (
                  <tr key={`${leave.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {typeof leave.userId === "object"
                        ? `${leave.userId.firstname} ${leave.userId.lastname}`
                        : leave.userId || "—"}
                      {typeof leave.userId === "object" && leave.userId?.employeeId && (
                        <p className="text-[11px] text-gray-400">{leave.userId.employeeId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(leave.leaveStartDate).toLocaleDateString('en-GB')} — {new Date(leave.leaveEndDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{leave.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{leave.numberOfDays || 1}d</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLE[leave.leaveStatus] || "bg-gray-100 text-gray-600"}`}>
                        {leave.leaveStatus}
                      </span>
                      {leave.leaveStatus === "REJECTED" && leave.rejectionReason && (
                        <p className="text-[10px] text-red-400 mt-0.5">{leave.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/view-leave/${leave.id}`} className="text-blue-500 hover:text-blue-700" title="View">
                          <Visibility fontSize="small" />
                        </Link>
                        {leave.leaveStatus === "PENDING" && isAdminOrHR && (
                          <>
                            <button onClick={() => handleApprove(leave.id)} className="text-emerald-600 hover:text-emerald-800" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleReject(leave.id)} className="text-red-500 hover:text-red-700" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {isAdminOrHR && (
                          <button onClick={() => handleDelete(leave.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                            <DeleteIcon fontSize="small" />
                          </button>
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

export default LeaveManagement;
