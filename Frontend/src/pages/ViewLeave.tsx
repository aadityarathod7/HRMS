import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LEAVE_TYPES = ["CASUAL", "SICK", "PRIVILEGE", "COMP_OFF", "MATERNITY", "PATERNITY", "LOP"];

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
};

const ViewLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState({ leaveStartDate: "", leaveEndDate: "", leaveType: "", description: "" });
  const navigate = useNavigate();

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/leaverequests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeave(res.data);
        setForm({
          leaveStartDate: res.data.leaveStartDate?.split("T")[0] || "",
          leaveEndDate: res.data.leaveEndDate?.split("T")[0] || "",
          leaveType: res.data.leaveType || "",
          description: res.data.description || "",
        });
      } catch {
        toast.error("Failed to load leave details");
      } finally {
        setLoading(false);
      }
    };
    fetchLeave();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/leaverequests/update/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Leave updated successfully");
      setLeave(res.data);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update leave");
    }
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value || "—"}</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!leave) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">Leave request not found.</p>
    </div>
  );

  const employeeName = typeof leave.userId === "object"
    ? `${leave.userId.firstname} ${leave.userId.lastname}`
    : leave.userId;

  const managerName = typeof leave.reportingManagerId === "object"
    ? `${leave.reportingManagerId.firstname} ${leave.reportingManagerId.lastname}`
    : leave.reportingManagerId;

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-light text-gray-900">Leave Request</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{employeeName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[leave.leaveStatus] || "bg-gray-100 text-gray-600"}`}>
                    {leave.leaveStatus}
                  </span>
                  {isAdminOrHR && !isEditing && leave.leaveStatus === "PENDING" && (
                    <button onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-500 transition">
                      Edit
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-500 transition">
                        Save
                      </button>
                      <button onClick={() => setIsEditing(false)}
                        className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </>
                  )}
                  <button onClick={() => navigate(-1)}
                    className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition">
                    Back
                  </button>
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <Field label="Employee" value={employeeName} />
                <Field label="Reporting Manager" value={managerName} />
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                  {isEditing
                    ? <input type="date" value={form.leaveStartDate} onChange={e => setForm(p => ({...p, leaveStartDate: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    : <p className="text-sm text-gray-900">{leave.leaveStartDate ? new Date(leave.leaveStartDate).toLocaleDateString("en-GB") : "—"}</p>
                  }
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                  {isEditing
                    ? <input type="date" value={form.leaveEndDate} min={form.leaveStartDate} onChange={e => setForm(p => ({...p, leaveEndDate: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    : <p className="text-sm text-gray-900">{leave.leaveEndDate ? new Date(leave.leaveEndDate).toLocaleDateString("en-GB") : "—"}</p>
                  }
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Leave Type</p>
                  {isEditing
                    ? <select value={form.leaveType} onChange={e => setForm(p => ({...p, leaveType: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    : <p className="text-sm text-gray-900">{leave.leaveType || "—"}</p>
                  }
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Days</p>
                  <p className="text-sm text-gray-900">{leave.numberOfDays || 1}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reason</p>
                  {isEditing
                    ? <textarea value={form.description} rows={3} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
                    : <p className="text-sm text-gray-900">{leave.description || "—"}</p>
                  }
                </div>
                {leave.rejectionReason && (
                  <div className="col-span-2 bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{leave.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ViewLeave;
