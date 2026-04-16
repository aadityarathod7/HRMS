import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const BRANCHES = ["IT", "HR", "BA", "FINANCE", "OPERATIONS", "MARKETING", "DESIGN", "QA", "SALES"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ROLES = ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"];
const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1.5";

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", dob: "", bloodGroup: "", branch: "", dateOfJoining: "",
    gender: "", address: "", contactNumber: "", userName: "", password: "", roles: [] as string[], email: "",
  });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, createdBy: localStorage.getItem("username") }),
      });
      if (response.ok) {
        toast.success("Employee registered successfully");
        navigate("/employeelist");
      } else {
        const err = await response.text();
        toast.error(err || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
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
              <h2 className="text-2xl font-light tracking-tight text-gray-900 mb-8">Employee Registration</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <div><label className={labelClass}>First Name</label><input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required className={inputClass} placeholder="John" /></div>
                  <div><label className={labelClass}>Last Name</label><input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required className={inputClass} placeholder="Doe" /></div>
                  <div><label className={labelClass}>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="john@sanvii.com" /></div>
                  <div><label className={labelClass}>Contact Number</label><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className={inputClass} placeholder="9876543210" /></div>
                  <div><label className={labelClass}>Username</label><input type="text" name="userName" value={formData.userName} onChange={handleChange} required className={inputClass} placeholder="john.doe" /></div>
                  <div><label className={labelClass}>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="Min 6 characters" /></div>
                  <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} required className={inputClass} /></div>
                  <div><label className={labelClass}>Date of Joining</label><input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className={inputClass}>
                      <option value="">Select</option>
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className={inputClass}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Branch</label>
                    <select name="branch" value={formData.branch} onChange={handleChange} required className={inputClass}>
                      <option value="">Select</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <select name="roles" value={formData.roles[0] || ""} onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })} required className={inputClass}>
                      <option value="">Select</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-5">
                  <label className={labelClass}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputClass} placeholder="Full address" />
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-500 transition text-sm" disabled={loading}>
                    {loading ? "Registering..." : "Register Employee"}
                  </button>
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

export default EmployeeRegistration;
