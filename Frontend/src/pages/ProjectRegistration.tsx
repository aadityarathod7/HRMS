import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import DateInput from "@/components/DateInput";

const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1.5";

const ProjectRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", teamMembers: "", startDate: "", endDate: "", status: "ACTIVE" });
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Project created successfully!");
        navigate("/project-management");
      } else {
        const err = await response.text();
        toast.error(err || "Failed to create project");
      }
    } catch (error) {
      toast.error("Failed to create project. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start">
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-light tracking-tight text-gray-900 mb-8">Create Project</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="sm:col-span-2"><label className={labelClass}>Project Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="e.g. HRMS Portal" /></div>
                  <div><label className={labelClass}>Start Date</label><DateInput value={formData.startDate} onChange={(v) => setFormData({...formData, startDate: v})} required className={inputClass} /></div>
                  <div><label className={labelClass}>End Date</label><DateInput value={formData.endDate} onChange={(v) => setFormData({...formData, endDate: v})} required className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} required className={inputClass}>
                      <option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="ONHOLD">On Hold</option><option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Team Members</label><input type="text" name="teamMembers" value={formData.teamMembers} onChange={handleChange} required className={inputClass} placeholder="Comma separated names" /></div>
                </div>
                <div className="mt-5">
                  <label className={labelClass}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className={`${inputClass} resize-none`} placeholder="Project description..." />
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-500 transition text-sm" disabled={loading}>{loading ? "Creating..." : "Create Project"}</button>
                  <button type="button" onClick={() => navigate(-1)} className="border border-gray-300 text-gray-600 bg-white px-6 py-2.5 rounded-md hover:bg-gray-50 transition text-sm">Cancel</button>
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

export default ProjectRegistration;
