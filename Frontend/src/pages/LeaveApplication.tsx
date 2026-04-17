import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LEAVE_TYPES = ["CASUAL", "SICK", "PRIVILEGE", "COMP_OFF", "MATERNITY", "PATERNITY", "LOP"];

const LeaveApplication = () => {
  const [loading, setLoading] = useState(false);
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const [managers, setManagers] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    userId: userProfile.id || "",
    reportingManagerId: "",
    leaveStartDate: "",
    leaveEndDate: "",
    leaveType: "",
    halfDay: false,
    halfDayType: "",
    description: "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API_URL}/user/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setManagers(res.data)).catch(() => {});
    if (userProfile.id) {
      axios.get(`${API_URL}/leaverequests/balance/${userProfile.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setLeaveBalance(res.data)).catch(() => {});
    }
  }, []);

  // When halfDay is true, end date = start date
  const handleStartDateChange = (v: string) => {
    setFormData(prev => ({
      ...prev,
      leaveStartDate: v,
      leaveEndDate: prev.halfDay ? v : (prev.leaveEndDate || v)
    }));
  };

  const handleHalfDayToggle = (val: boolean) => {
    setFormData(prev => ({
      ...prev,
      halfDay: val,
      leaveEndDate: val ? prev.leaveStartDate : prev.leaveEndDate,
      halfDayType: val ? "FIRST_HALF" : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveStartDate || !formData.leaveEndDate) {
      toast.error("Please select start and end dates");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/leaverequests/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.status === 201) {
        toast.success("Leave application submitted!");
        setFormData({ userId: userProfile.id || "", reportingManagerId: "", leaveStartDate: "", leaveEndDate: "", leaveType: "", halfDay: false, halfDayType: "", description: "" });
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to submit" }));
        toast.error(errorData.message || "Failed to submit leave");
      }
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Apply for Leave</h2>
              <p className="text-sm text-gray-400 mb-6">Fill in the details below to submit your leave request</p>

              {/* Leave Balance */}
              {leaveBalance.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-3">
                  {leaveBalance.map((lb: any, i: number) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <p className="text-lg font-light text-gray-900">{lb.available}</p>
                      <p className="text-[11px] text-gray-500">{lb.leaveType}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Reporting Manager */}
                <div>
                  <label className={labelClass}>Reporting Manager</label>
                  <select value={formData.reportingManagerId} onChange={(e) => setFormData({...formData, reportingManagerId: e.target.value})} required className={inputClass}>
                    <option value="">Select Manager</option>
                    {managers.filter((m: any) => m.id !== userProfile.id).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.firstname} {m.lastname}</option>
                    ))}
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label className={labelClass}>Leave Type</label>
                  <div className="flex flex-wrap gap-2">
                    {LEAVE_TYPES.map(t => (
                      <button key={t} type="button"
                        onClick={() => setFormData({...formData, leaveType: t})}
                        className={`px-4 py-2 rounded-lg text-sm border transition ${formData.leaveType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Half Day Toggle */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => handleHalfDayToggle(!formData.halfDay)}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.halfDay ? "bg-blue-600" : "bg-gray-300"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.halfDay ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <span className="text-sm text-gray-700">Half Day</span>
                  </label>
                  {formData.halfDay && (
                    <div className="flex gap-2">
                      {["FIRST_HALF", "SECOND_HALF"].map(h => (
                        <button key={h} type="button"
                          onClick={() => setFormData({...formData, halfDayType: h})}
                          className={`px-3 py-1.5 rounded-md text-xs border transition ${formData.halfDayType === h ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                          {h === "FIRST_HALF" ? "First Half" : "Second Half"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.leaveStartDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      End Date {formData.halfDay && <span className="text-blue-500 normal-case text-[10px]">Auto-set for half day</span>}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.leaveEndDate}
                      min={formData.leaveStartDate || new Date().toISOString().split("T")[0]}
                      disabled={formData.halfDay}
                      onChange={(e) => setFormData({...formData, leaveEndDate: e.target.value})}
                      className={`${inputClass} ${formData.halfDay ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>

                {/* Days preview */}
                {formData.leaveStartDate && formData.leaveEndDate && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                    {formData.halfDay
                      ? `0.5 day — ${formData.halfDayType === "FIRST_HALF" ? "First Half" : formData.halfDayType === "SECOND_HALF" ? "Second Half" : "Select half"}`
                      : (() => {
                          const start = new Date(formData.leaveStartDate);
                          const end = new Date(formData.leaveEndDate);
                          const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          return `${days} day${days > 1 ? "s" : ""} leave — ${start.toLocaleDateString("en-GB")} to ${end.toLocaleDateString("en-GB")}`;
                        })()
                    }
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className={labelClass}>Reason</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Reason for leave..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-500 transition text-sm" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                  <button type="button"
                    onClick={() => setFormData({ userId: userProfile.id || "", reportingManagerId: "", leaveStartDate: "", leaveEndDate: "", leaveType: "", halfDay: false, halfDayType: "", description: "" })}
                    className="border border-gray-300 text-gray-600 bg-white px-6 py-2.5 rounded-md hover:bg-gray-50 transition text-sm">
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LeaveApplication;
