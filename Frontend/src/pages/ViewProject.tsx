import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/project/${id}`,
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

    if (name === "name" && !/^[A-Z]*$/.test(value) && value) {
      setProjectError("Please enter only uppercase alphabets.");
      return;
    } else {
      setProjectError("");
    }

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
          `http://localhost:5000/project/update/${id}`,
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
          `http://localhost:5000/project/${id}`,
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

        await axios.put(
          `http://localhost:5000/project/deactivate/${project.id}`,
          {},
          { headers }
        );

        toast.success("project deactivated successfully!");
        // Optionally, you can fetch the updated user data or handle state changes here
      } catch (err) {
        console.error("Error deactivating project:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to deactivate project: ${err.response.data}`);
        } else {
          toast.error("Failed to deactivate project. Please try again later.");
        }
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

        console.log(`Activating project for user ID: ${project.id}`);

        const response = await axios.put(
          `http://localhost:5000/project/activate/${project.id}`,
          {},
          { headers }
        );
        console.log("Activation response:", response.data);

        toast.success("project activated successfully!");
        // Optionally, you can fetch the updated user data or handle state changes here
      } catch (err) {
        console.error("Error activating project:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to activate project: ${err.response.data}`);
        } else {
          toast.error("Failed to activate project. Please try again later.");
        }
      }
    } else {
      console.error("User is not defined.");
    }
  };

  if (loading) return <p>Loading project details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>No project details found.</p>;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
      />
      <div className="bg-blue-50 shadow-lg rounded-lg p-8 w-1/2 ml-40 mt-20 mb-20">
        <DashboardSidebar isCollapsed={isCollapsed} />
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSaveProject}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
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
                {new Date(project.startDate).toLocaleDateString() ||
                  "No start date"}
              </p>
            </div>
            <div>
              <strong>End Date:</strong>
              <p className="min-h-[40px]">
                {new Date(project.endDate).toLocaleDateString() ||
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
                  ? new Date(project.createdDate).toLocaleDateString()
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
                  ? new Date(project.updatedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProject;
