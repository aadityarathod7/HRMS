import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ViewProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/project/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(response.data);
      } catch {
        setError("Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProjectError("");
    setProject((prevProject) => ({ ...prevProject, [name]: value }));
  };

  const handleSaveProject = async () => {
    if (project) {
      try {
        const token = localStorage.getItem("token");
        const updateProjectRequest = {
          name: project.name,
          description: project.description,
          status: project.status,
        };

        await axios.put(
          `${API_URL}/project/update/${id}`,
          updateProjectRequest,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Project updated successfully!");
        setIsEditing(false);
        const updatedProject = await axios.get(
          `${API_URL}/project/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(updatedProject.data);
      } catch (err) {
        toast.error("Failed to update project. Please try again later.");
      }
    }
  };

  const handleDeactivateproject = async () => {
    if (project) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        await axios.patch(
          `${API_URL}/project/deactivate/${project.id}`,
          {},
          { headers }
        );
        setProject((p: any) => ({ ...p, status: "INACTIVE" }));
        toast.success("Project deactivated successfully!");
        // Optionally, you can fetch the updated user data or handle state changes here
      } catch (err) {
        toast.error("Failed to deactivate project");
      }
    }
  };

  const handleActivateproject = async () => {
    if (project) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };


        await axios.put(
          `${API_URL}/project/activate/${project.id}`,
          {},
          { headers }
        );
        setProject((p: any) => ({ ...p, status: "ACTIVE" }));
        toast.success("Project activated successfully!");
      } catch (err) {
        toast.error("Failed to activate project");
      }
    }
  };

  if (loading) return <p>Loading project details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>No project details found.</p>;

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}><div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start"><div className="w-full max-w-2xl mb-20"><div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                onClick={handleSaveProject}
              >
                Save
              </button>
              <button
                className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm ml-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : isAdminOrHR ? (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          ) : null}
          <button
            className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm ml-2"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-4">
          Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              {/* <strong>Project ID:</strong>
              <p className="min-h-[40px]">
                {project?.projectId || "No project ID"}
              </p> */}
            </div>
            <div>
              <strong>Project Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={project?.name || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px]"
                />
              ) : (
                <p className="min-h-[40px]">
                  {project?.name || "No project name"}
                </p>
              )}
              {projectError && (
                <div className="text-red-500 mt-1">{projectError}</div>
              )}
            </div>
            <div>
              <strong>Description:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="description"
                  value={project?.description || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px]"
                />
              ) : (
                <p className="min-h-[40px]">
                  {project?.description || "No Description"}
                </p>
              )}
            </div>
            <div>
              <strong>Team Members:</strong>
              <p className="min-h-[40px]">
                {project?.teamMembers || "No team members"}
              </p>
            </div>
            <div>
              <strong>Start Date:</strong>
              <p className="min-h-[40px]">
                {new Date(project.startDate).toLocaleDateString('en-GB') ||
                  "No start date"}
              </p>
            </div>
            <div>
              <strong>End Date:</strong>
              <p className="min-h-[40px]">
                {new Date(project.endDate).toLocaleDateString('en-GB') ||
                  "No end date"}
              </p>
            </div>
            <div>
              <strong>Status:</strong>
              {isEditing ? (
                <select
                  name="status"
                  value={project?.status || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ONHOLD">On Hold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              ) : (
                <p className="min-h-[40px]">{project.status || "No status"}</p>
              )}
            </div>
            <div>
              <strong>Created By:</strong>
              <p className="min-h-[40px]">{project.createdBy || "N/A"}</p>
            </div>
            <div>
              <strong>Created Date:</strong>
              <p className="min-h-[40px]">
                {project.createdDate
                  ? new Date(project.createdDate).toLocaleDateString('en-GB')
                  : "N/A"}
              </p>
            </div>
            <div>
              <strong>Updated By:</strong>
              <p className="min-h-[40px]">{project.updatedBy || "N/A"}</p>
            </div>
            <div>
              <strong>Updated Date:</strong>
              <p className="min-h-[40px]">
                {project.updatedDate
                  ? new Date(project.updatedDate).toLocaleDateString('en-GB')
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default ViewProject;
