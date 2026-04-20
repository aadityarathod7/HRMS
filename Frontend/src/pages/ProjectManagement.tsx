import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  ONHOLD:    "bg-amber-50 text-amber-700",
  INACTIVE:  "bg-gray-100 text-gray-500",
};

const ProjectManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const navigate = useNavigate();

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchProjects = async (status = selectedStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/project/getByStatus/${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data || []);
    } catch {
      toast.error("Failed to load projects");
      setProjects([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(selectedStatus); }, [selectedStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    // useEffect triggers fetchProjects with new status
  };

  const handleSetStatus = async (id: string, status: string) => {
    const action = status === "INACTIVE" ? "deactivate" : "activate";
    if (!window.confirm(`${status === "INACTIVE" ? "Deactivate" : "Activate"} this project?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/project/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Project ${status === "INACTIVE" ? "deactivated" : "activated"}`);
      fetchProjects(selectedStatus);
    } catch {
      toast.error(`Failed to ${action} project`);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Projects</h1>
              <p className="text-sm text-gray-400 mt-1">Manage all company projects</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedStatus} onChange={handleStatusChange}
                className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ONHOLD">On Hold</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {isAdminOrHR && (
                <button onClick={() => navigate("/project-registration")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition text-sm">
                  + Add Project
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Project ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Start Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">End Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No {selectedStatus.toLowerCase()} projects</td></tr>
                ) : projects.map((project) => (
                  <tr key={project.projectId || project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{project.projectId || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{project.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLE[project.status] || "bg-gray-100 text-gray-500"}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/view-project/${project.projectId || project.id}`)}
                          className="text-blue-500 hover:text-blue-700" title="View">
                          <Eye size={16} />
                        </button>
                        {isAdminOrHR && (
                          project.status === "INACTIVE"
                            ? <button onClick={() => handleSetStatus(project.projectId || project.id, "ACTIVE")}
                                className="text-xs text-emerald-600 hover:text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                                Activate
                              </button>
                            : <button onClick={() => handleSetStatus(project.projectId || project.id, "INACTIVE")}
                                className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 px-2 py-0.5 rounded">
                                Deactivate
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

export default ProjectManagement;
