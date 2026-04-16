import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import {
  Visibility,
  RemoveCircleOutline,
  CheckCircle,
  KeyboardArrowDown,
} from "@mui/icons-material";
import Footer from "@/components/Footer";

const EmployeeList: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchUsers = async (isActive: boolean) => {
    const username = localStorage.getItem("username"); // Retrieve username from local storage
    console.log("Username from local storage:", username); // Debugging log
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/user/all?isActive=${isActive ? 1 : 0}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API response data:", data); // Debugging log

      // Check if createdBy is present in the response
      data.forEach((user) => {
        console.log(`User ID: ${user.id}, Created By: ${user.createdBy}`);
      });

      const usersWithCreator = data.map((user: UserDto) => ({
        ...user,
        createdBy: user.createdBy || username, // Use local storage username if createdBy is not set
      }));

      console.log("Fetched users with creator:", usersWithCreator); // Debugging log
      setUsers(usersWithCreator);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(true); // Fetch active users by default
  }, []);

  const handleSelectUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((i) => i !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleView = (id: number) => {
    // Implement the view logic
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this employee?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/user/deactivate/${id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the user from the local state
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deactivating user:", error);
        alert("Failed to deactivate employee. Please try again.");
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this employee?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/user/activate/${id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refetch users after activation
        fetchUsers(showInactive); // Fetch users based on the current filter (active/inactive)
      } catch (error) {
        console.error("Error activating user:", error);
        alert("Failed to activate employee. Please try again.");
      }
    }
  };

  const handleDeleteSelected = () => {
    // Implement the delete selected logic
  };

  const handleViewSelected = () => {
    // Implement the view selected logic
  };

  const roleLabels = {
    ROLE_USER: "User",
    ROLE_ADMIN: "Admin",
    // Add other roles as needed
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
              value={showInactive ? "inactive" : "active"}
              onChange={(e) => {
                const isActive = e.target.value === "active";
                setShowInactive(!isActive);
                fetchUsers(isActive); // Fetch users based on selection
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white text-sm">
              <KeyboardArrowDown />
            </span>
          </div>
        </div>
        {isAdminOrHR && (
          <Link to="/employeeregistration">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
              Register Employee
            </button>
          </Link>
        )}
      </div>

      <div
        className={`transition-all duration-300 px-6 ${
          isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"
        }`}
      >
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 mt-5">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Full Name
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Username
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Branch
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Date of Joining
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Contact Number
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Roles
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Created By
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-gray-800 text-sm">
                      {`${user.firstname || "No First Name"} ${
                        user.lastname || ""
                      }`.trim()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.userName || "No Username"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.email || "No Email"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.branch || "No Branch"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : "No Date of Joining"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.contactNumber || "No Contact Number"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.roles && user.roles.length > 0
                        ? user.roles
                            .map(
                              (roleObj) =>
                                roleLabels[roleObj.role] || roleObj.role
                            )
                            .join(", ")
                        : "No Roles"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.createdBy || "No Creator"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-3">
                        <Link
                          to={`/view-Employee/${user.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                          title="View"
                        >
                          <Visibility />
                        </Link>
                        {isAdminOrHR && (showInactive ? (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Activate"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                            title="Deactivate"
                          >
                            Deactivate
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    No users found.
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

export default EmployeeList;
