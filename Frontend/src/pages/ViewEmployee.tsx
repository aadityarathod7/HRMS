import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Briefcase, CreditCard, Phone, Shield } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ViewEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch (err) { toast.error("Failed to load employee details"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/user/update/${id}`, {
        ...user,
        roles: user.roles?.map((r: any) => r.role || r) || [],
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Employee updated!");
      setIsEditing(false);
      fetchUser();
    } catch (err) { toast.error("Failed to update"); }
  };

  const Field = ({ label, name, value, type = "text", editable = true }: any) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {isEditing && editable ? (
        <input type={type} name={name} value={value || ""} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
      ) : (
        <p className="text-sm text-gray-900">{
          type === "date" && value ? new Date(value).toLocaleDateString('en-GB') :
          value || <span className="text-gray-300">—</span>
        }</p>
      )}
    </div>
  );

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "organization", label: "Organization", icon: Briefcase },
    { id: "bank", label: "Bank & ID", icon: CreditCard },
    { id: "emergency", label: "Emergency", icon: Phone },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">Loading...</p></div>;

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">
          {user && (
            <div className="max-w-4xl mx-auto">
              {/* Header Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-light">
                      {(user.firstname || "?").charAt(0)}{(user.lastname || "").charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-xl font-light text-gray-900">{user.firstname} {user.lastname}</h1>
                      <p className="text-sm text-gray-500">{user.designation || "—"} · {user.department?.departmentName || "—"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{user.employeeId}</span>
                        <span className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${
                          user.status === "ACTIVE" ? "bg-blue-100 text-blue-700" :
                          user.status === "PROBATION" ? "bg-amber-50 text-amber-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{user.status || (user.isActive ? "ACTIVE" : "INACTIVE")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm">Save</button>
                        <button onClick={() => { setIsEditing(false); fetchUser(); }} className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm">Cancel</button>
                      </>
                    ) : (
                      <>
                        {isAdminOrHR && <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm">Edit</button>}
                        <button onClick={() => navigate(-1)} className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm">Back</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition ${
                      activeTab === tab.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}>
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {activeTab === "personal" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Field label="First Name" name="firstname" value={user.firstname} />
                    <Field label="Last Name" name="lastname" value={user.lastname} />
                    <Field label="Email" name="email" value={user.email} />
                    <Field label="Phone" name="contactNumber" value={user.contactNumber} />
                    <Field label="Date of Birth" name="dob" value={user.dob} type="date" />
                    <Field label="Gender" name="gender" value={user.gender} />
                    <Field label="Blood Group" name="bloodGroup" value={user.bloodGroup} />
                    <Field label="Address" name="address" value={user.address} />
                    <Field label="Username" name="userName" value={user.userName} editable={false} />
                  </div>
                )}

                {activeTab === "organization" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Field label="Employee ID" name="employeeId" value={user.employeeId} editable={false} />
                    <Field label="Designation" name="designation" value={user.designation} />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm text-gray-900">{user.department?.departmentName || "—"}</p>
                    </div>
                    <Field label="Branch" name="branch" value={user.branch} />
                    <Field label="Employment Type" name="employmentType" value={user.employmentType} />
                    <Field label="Date of Joining" name="dateOfJoining" value={user.dateOfJoining} type="date" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reporting Manager</p>
                      <p className="text-sm text-gray-900">
                        {user.reportingManager ? `${user.reportingManager.firstname} ${user.reportingManager.lastname} (${user.reportingManager.employeeId})` : "—"}
                      </p>
                    </div>
                    <Field label="CTC (Annual)" name="ctc" value={user.ctc ? `₹${Number(user.ctc).toLocaleString("en-IN")}` : null} editable={false} />
                    <Field label="Notice Period (Days)" name="noticePeriod" value={user.noticePeriod} />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Roles</p>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map((r: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700">{r.role || r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "bank" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Field label="PAN Number" name="panNumber" value={user.panNumber} />
                    <Field label="Aadhar Number" name="aadharNumber" value={user.aadharNumber} />
                    <Field label="Bank Account No." name="bankAccountNumber" value={user.bankAccountNumber} />
                    <Field label="Bank Name" name="bankName" value={user.bankName} />
                    <Field label="IFSC Code" name="ifscCode" value={user.ifscCode} />
                  </div>
                )}

                {activeTab === "emergency" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Emergency Contact Name" name="emergencyContactName" value={user.emergencyContactName} />
                    <Field label="Emergency Contact Number" name="emergencyContactNumber" value={user.emergencyContactNumber} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ViewEmployee;
