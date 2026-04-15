import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import {
  RemoveCircleOutline,
  CheckCircle,
  KeyboardArrowDown,
} from "@mui/icons-material";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const RoleManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // const [createdBy, setCreatedBy] = useState<string>("");
  // const [updatedBy, setUpdatedBy] = useState<string>("");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // toast.error("Authentication token not found");
        return;
      }

      const response = await axios.get("http://localhost:8081/role/active", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Detailed logging
      console.log("Raw response data:", response.data);

      // Log the keys to ensure they exist
      response.data.forEach((role: any) => {
      });

      // Try sorting explicitly by creation date
      const sortedRoles = [...response.data].sort((a, b) => {
        // Convert dates to timestamps for comparison
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();

        return dateA - dateB; // Ascending order (newest at the end)
      });


      // Set the sorted roles
      setUsers(sortedRoles);
    } catch (error) {
      handleFetchError(error, "active");
    }
  };

  const fetchInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // toast.error("Authentication token not found");
        return;
      }

      const response = await axios.get("http://localhost:8081/role/inactive", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Simply set the users without sorting
      setUsers(response.data);
      toast.success("Inactive roles loaded successfully");
    } catch (error) {
      handleFetchError(error, "inactive");
    }
  };

  const handleFetchError = (error: any, type: string) => {
    console.error(`Error fetching ${type} roles:`, error);

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      setUsers([]);
      toast.info(`No ${type} roles found`);
      return;
    }

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // toast.error(error.response.data?.message || `Failed to fetch ${type} roles`);
      } else if (error.request) {
        // toast.error("No response from server");
      } else {
        // toast.error(`Error fetching ${type} roles`);
      }
    } else {
      // toast.error("An unexpected error occurred");
    }
    setUsers([]);
  };

  const handleActivateRole = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this role?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // toast.error("Authentication token not found");
          return;
        }

        const response = await axios.put(
          `http://localhost:8081/role/activate/${id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 200) {
          toast.success("Role activated successfully");

          // If currently viewing inactive roles, refresh inactive roles
          if (showInactive) {
            await fetchInactiveUsers();
          } else {
            // If viewing active roles, refresh active roles
            await fetchUsers();
          }
        } else {
          throw new Error("Failed to activate role");
        }
      } catch (error) {
        console.error("Error activating role:", error);

        if (axios.isAxiosError(error)) {
          if (error.response) {
            // toast.error(error.response.data?.message || "Failed to activate role");
          } else if (error.request) {
            // toast.error("No response from server. Please try again.");
          } else {
            // toast.error("Error activating role");
          }
        } else {
          // toast.error("An unexpected error occurred");
        }
      }
    }
  };

  const handleDeactivateRole = async (roleId: number) => {
    if (!window.confirm("Are you sure you want to deactivate this role?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // toast.error("Authentication token not found");
        return;
      }

      const response = await axios({
        method: "PATCH",
        url: `http://localhost:8081/role/deactivate/${roleId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Role deactivated successfully");

        // If currently viewing active roles, refresh active roles
        if (!showInactive) {
          await fetchUsers();
        } else {
          // If viewing inactive roles, refresh inactive roles
          await fetchInactiveUsers();
        }
      } else {
        throw new Error("Failed to deactivate role");
      }
    } catch (error) {
      console.error("Error deactivating role:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // toast.error(error.response.data?.message || "Failed to deactivate role");
        } else if (error.request) {
          // toast.error("No response from server. Please try again.");
        } else {
          // toast.error("Error deactivating role");
        }
      } else {
        // toast.error("An unexpected error occurred");
      }
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    try {
      const isActive = e.target.value === "active";
      setShowInactive(!isActive);

      if (isActive) {
        await fetchUsers();
      } else {
        await fetchInactiveUsers();
      }
    } catch (error) {
      console.error("Error changing role status view:", error);
      // toast.error("Failed to change role status view");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateRole = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // toast.error("Authentication token not found");
      return;
    }

    const storedUsername = localStorage.getItem("username") || "Unknown";

    const newRole = {
      role: role,
      description: description,
    };

    try {
      const response = await axios.post(
        "http://localhost:8081/role/create",
        newRole,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle success
      toast.success("Role created successfully");

      // Reset input fields
      setRole("");
      setDescription("");

      // Refresh the list of roles based on current view
      if (showInactive) {
        // If currently viewing inactive roles, fetch active roles
        await fetchUsers();
      } else {
        // If currently viewing active roles, fetch active roles
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error creating role:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // toast.error(error.response.data?.message || "Failed to create role");
        } else if (error.request) {
          // toast.error("No response from server");
        } else {
          // toast.error("Failed to create role");
        }
      } else {
        // toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      <div className={`mt-5 flex justify-end w-full gap-4`}>
        <div className="flex gap-2">
          <label
            htmlFor="userStatus"
            className="block text-sm font-medium text-gray-700"
          >
            Role Status
          </label>
          <div className="relative mt-20">
            <select
              className="bg-purple-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 hover:bg-violet-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
              value={showInactive ? "inactive" : "active"}
              onChange={handleStatusChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white text-sm">
              <KeyboardArrowDown />
            </span>
          </div>
        </div>
        <Link to="/roleregistration">
          <button className="bg-purple-600 text-white px-6 py-3 mt-20 rounded-lg hover:bg-violet-700 transition duration-300">
            Add Role
          </button>
        </Link>
      </div>

      <div
        className={`mr-10 w-full max-w-6xl transition-all duration-300 ${
          isCollapsed ? "ml-40" : "ml-80"
        }`}
      >
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 mt-5">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-violet-600">
                <th className="p-3 font-semibold text-white text-left">
                  Role ID
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Role Name
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Description
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Created By
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Created Date
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((role) => {
                  console.log("Role object:", role);
                  return (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-3 text-gray-700">{role.id}</td>
                      <td className="p-3 text-gray-700">{role.role}</td>
                      <td className="p-3 text-gray-700">{role.description}</td>
                      <td className="p-3 text-gray-700">{role.createdBy}</td>
                      <td className="p-3 text-gray-700">{role.createdDate}</td>
                      <td className="p-3">
                        <div className="flex space-x-3">
                          <Link
                            to={`/view-role/${role.id}`}
                            className="text-purple-600 hover:text-purple-800 transition-colors duration-150"
                            title="View"
                          >
                            <Visibility />
                          </Link>
                          {showInactive ? (
                            <button
                              onClick={() => handleActivateRole(role.id)}
                              className="text-green-600 hover:text-green-800 transition-colors duration-150"
                              title="Activate"
                            >
                              <CheckCircle />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                console.log(
                                  "Deactivate button clicked for role:",
                                  role
                                );
                                handleDeactivateRole(role.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors duration-150"
                              title="Deactivate"
                            >
                              <RemoveCircleOutline />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="text-gray-500">
                      {showInactive
                        ? "There are currently no inactive roles"
                        : "There are currently no active roles"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between">
          {/* Removed View Selected button */}
          {/* Removed Delete Selected button */}
        </div>
        <Footer className="mt-8" />
      </div>
    </div>
  );
};

export default RoleManagement;
