import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1.5";

const RoleRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({ role: "", description: "" });
  const [roleError, setRoleError] = useState("");
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "role" && !/^[A-Z_]*$/.test(value)) {
      setRoleError("Uppercase letters and underscores only");
      return;
    }
    setRoleError("");
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(, { role: formData.role, description: formData.description }, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      toast.success("Role created successfully");
      navigate("/role-management");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Failed to create role");
      } else { toast.error("An error occurred"); }
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-light tracking-tight text-gray-900 mb-8">Add Role</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Role Name</label>
                    <input type="text" name="role" value={formData.role} onChange={handleChange} required className={inputClass} placeholder="e.g. MANAGER" />
                    {roleError && <p className="text-red-500 text-xs mt-1">{roleError}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} required className={inputClass} placeholder="Role description" />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-500 transition text-sm" disabled={loading}>{loading ? "Creating..." : "Create Role"}</button>
                  <button type="button" onClick={() => navigate("/role-management")} className="border border-gray-300 text-gray-600 bg-white px-6 py-2.5 rounded-md hover:bg-gray-50 transition text-sm">Cancel</button>
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

export default RoleRegistration;
