import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, Delete } from "@mui/icons-material";
import { RemoveCircleOutline, CheckCircle } from "@mui/icons-material";
import Footer from "@/components/Footer";
import axios from "axios";
import { KeyboardArrowDown } from "@mui/icons-material";

const ProjectManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedprojectType, setSelectedprojectType] = useState("sick");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [buttonText, setButtonText] = useState("Active Projects");
  const [selectedStatus, setSelectedStatus] = useState("active");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/project/all", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setUsers(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setUsers([]);
          return;
        }
        console.error("Error response:", error.response.data);
      } else {
        console.error("Non-axios error:", error);
      }
      setUsers([]);
    }
  };

  const fetchInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          "http://localhost:5000/project/getByStatus/INACTIVE",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        setUsers(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setUsers([]);
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error fetching inactive projects:", error);
      setUsers([]);
    }
  };

  const handleActivateproject = async (id) => {
    if (!id) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/project/activate/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      if (showInactive) {
        await fetchInactiveUsers();
      } else {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error activating project:", error);
    }
  };

  const handleDeactivateproject = async (projectId) => {
    if (!projectId) {
      return;
    }

    if (!window.confirm("Are you sure you want to deactivate this project?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios({
        method: "PATCH",
        url: `http://localhost:5000/project/deactivate/${projectId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        await fetchUsers();
      } else {
        throw new Error("Failed to deactivate project");
      }
    } catch (error) {
      console.error("Error deactivating project:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error deactivating project");
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/project/getByStatus/ACTIVE",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.text();
        console.error("Error fetching projects:", errorData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Unknown";
  }, []);

  const handleSelectUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((i) => i !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleView = (projectId) => {
    navigate(`/view-project/${projectId}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this project?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/project/deactivate/${id}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deactivating project:", error);
        alert("Failed to deactivate project. Please try again.");
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this project?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/project/activate/${id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchUsers();
      } catch (error) {
        console.error("Error activating user:", error);
        alert("Failed to activate project. Please try again.");
      }
    }
  };

  const handleDeleteSelected = () => {};

  const handleViewSelected = () => {};

  const fetchCompletedProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5000/project/getByStatus/COMPLETED",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching completed projects:", error);
    }
  };

  const fetchActiveProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5000/project/getByStatus/ACTIVE",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching active projects:", error);
    }
  };

  const fetchOnHoldProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5000/project/getByStatus/ONHOLD",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching on hold projects:", error);
    }
  };

  const handleStatusChange = async (e) => {
    const selectedStatus = e.target.value;
    setSelectedStatus(selectedStatus);
    setShowInactive(selectedStatus === "INACTIVE");

    if (selectedStatus === "ACTIVE") {
      await fetchActiveProjects();
    } else if (selectedStatus === "COMPLETED") {
      await fetchCompletedProjects();
    } else if (selectedStatus === "ONHOLD") {
      await fetchOnHoldProjects();
    } else if (selectedStatus === "INACTIVE") {
      await fetchInactiveUsers();
    }
  };

  const handleCreateproject = async () => {
    const token = localStorage.getItem("token");

    try {
      const newproject = {};

      const response = await axios.post(
        "http://localhost:5000/project/create",
        newproject,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchUsers();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleprojectTypeChange = (e) => {
    setSelectedprojectType(e.target.value);
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      <div className={`pt-28 flex justify-end w-full gap-4 px-6`}>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="border border-blue-600 text-blue-600 bg-white px-5 py-2 rounded-md appearance-none pr-10 hover:bg-blue-50 transition text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ONHOLD">On Hold</option>
              <option value="INACTIVE">In Active</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white text-sm">
              <KeyboardArrowDown />
            </span>
          </div>
        </div>
        {isAdminOrHR && (
          <Link to="/project-registration">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
              Add Project
            </button>
          </Link>
        )}
      </div>

      <div
        className={`transition-all duration-300 px-6 ${
          isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"
        }`}
      >
        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 mt-5">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    Project ID
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((project) => (
                    <tr
                      key={project.projectId}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-gray-800 text-sm">{project.projectId}</td>
                      <td className="px-4 py-3 text-gray-800 text-sm">{project.name}</td>
                      <td className="px-4 py-3 text-gray-800 text-sm">
                        {new Date(project.startDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-gray-800 text-sm">
                        {new Date(project.endDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-gray-800 text-sm">
                        
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        
                        {project.status} </span></td>
                      <td className="px-4 py-3 text-gray-800 text-sm flex space-x-2">
                        <button
                          className="bg-transparent hover:bg-gray-200 rounded-full p-2"
                          onClick={() => handleView(project.projectId)}
                        >
                          <Visibility className="text-blue-600 hover:text-blue-800 transition-colors duration-1500" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeactivateproject(project.projectId)
                          }
                          className="text-gray-500 hover:text-gray-700 text-sm"
                          title="Deactivate"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="text-gray-500">No projects found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-between"></div>
        <Footer className="mt-8" />
      </div>
    </div>
  );
};

export default ProjectManagement;
