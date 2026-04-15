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

  const fetchUsers = async (isActive: boolean) => {
    const username = localStorage.getItem("username"); // Retrieve username from local storage
    console.log("Username from local storage:", username); // Debugging log
    try {
      const response = await fetch(
        `http://localhost:5000/user/all?isActive=${isActive ? 1 : 0}`
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
        const response = await fetch(
          `http://localhost:5000/user/deactivate/${id}`,
          {
            method: "PUT",
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
        const response = await fetch(
          `http://localhost:5000/user/activate/${id}`,
          {
            method: "PUT",
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
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      <div className={`mt-5 flex justify-end w-full gap-4`}>
        <div className="flex gap-2">
          <div className="relative mt-20">
            <select
              className="bg-purple-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 hover:bg-violet-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
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
        <Link to="/employeeregistration">
          <button className="bg-purple-600 text-white px-6 py-3 mt-20 rounded-lg hover:bg-violet-700 transition duration-300">
            Register Employee
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
                  Full Name
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Username
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Email
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Branch
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Date of Joining
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Contact Number
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Roles
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Created By
                </th>
                <th className="p-3 font-semibold text-white text-left">
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
                    <td className="p-3 text-gray-700">
                      {`${user.firstname || "No First Name"} ${
                        user.lastname || ""
                      }`.trim()}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.userName || "No Username"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.email || "No Email"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.branch || "No Branch"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.dateOfJoining || "No Date of Joining"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.contactNumber || "No Contact Number"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.roles && user.roles.length > 0
                        ? user.roles
                            .map(
                              (roleObj) =>
                                roleLabels[roleObj.role] || roleObj.role
                            )
                            .join(", ")
                        : "No Roles"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.createdBy || "No Creator"}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-3">
                        <Link
                          to={`/view-Employee/${user.id}`}
                          className="text-purple-600 hover:text-purple-800 transition-colors duration-150"
                          title="View"
                        >
                          <Visibility />
                        </Link>
                        {showInactive ? (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="text-green-600 hover:text-green-800 transition-colors duration-150"
                            title="Activate"
                          >
                            <CheckCircle />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                            title="Deactivate"
                          >
                            <RemoveCircleOutline />
                          </button>
                        )}
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
