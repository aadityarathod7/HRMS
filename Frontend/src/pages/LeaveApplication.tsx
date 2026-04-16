import { useState } from "react";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const LEAVE_TYPES = ["CASUAL", "SICK", "ANNUAL", "MATERNITY", "PATERNITY"];

const LeaveApplication = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    reportingManagerId: "",
    leaveStartDate: "",
    leaveEndDate: "",
    leaveType: "",
    description: "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/leaverequests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.status === 201) {
        toast.success("Leave application submitted!");
        setFormData({ userId: "", reportingManagerId: "", leaveStartDate: "", leaveEndDate: "", leaveType: "", description: "" });
      } else {
        const errorData = await response.text();
        toast.error(errorData || "Failed to submit leave");
      }
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start">
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-light tracking-tight text-gray-900 mb-8">
                Leave Application
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">User ID</label>
                    <input
                      type="text" name="userId" value={formData.userId} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Reporting Manager ID</label>
                    <input
                      type="text" name="reportingManagerId" value={formData.reportingManagerId} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter manager ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input
                      type="date" name="leaveStartDate" value={formData.leaveStartDate} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                    <input
                      type="date" name="leaveEndDate" value={formData.leaveEndDate} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Leave Type</label>
                    <select
                      name="leaveType" value={formData.leaveType} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    name="description" value={formData.description} onChange={handleChange} required rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Reason for leave..."
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-500 transition text-sm"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ userId: "", reportingManagerId: "", leaveStartDate: "", leaveEndDate: "", leaveType: "", description: "" })}
                    className="border border-gray-300 text-gray-600 bg-white px-6 py-2.5 rounded-md hover:bg-gray-50 transition text-sm"
                  >
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
