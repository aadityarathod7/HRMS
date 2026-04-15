import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility, KeyboardArrowDown } from "@mui/icons-material";
import { RemoveCircleOutline, CheckCircle } from "@mui/icons-material";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const DepartmentManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/departments/active",
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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setUsers([]);
          toast.info("No active departments found");
          return;
        }

        if (error.response) {
          console.error("Error response:", error.response.data);
          toast.error(
            error.response.data?.message || "Failed to fetch active departments"
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          toast.error("No response from server");
        }
      } else {
        console.error("Non-axios error:", error);
        toast.error("An unexpected error occurred");
      }
      setUsers([]);
    }
  };

  const fetchInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/departments/inactive",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        setUsers(response.data);
        toast.success("Inactive departments loaded successfully");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setUsers([]);
          toast.info("No inactive departments found");
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error fetching inactive departments:", error);
      setUsers([]);

      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast.error("Failed to fetch inactive departments");
      }
    }
  };

  const handleActivateDepartment = async (id) => {
    if (!id) {
      toast.error("Invalid department ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/departments/activate/${id}`,
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

      toast.success("Department activated successfully");
      if (showInactive) {
        await fetchInactiveUsers();
      } else {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error activating department:", error);
      toast.error("Failed to activate department");
    }
  };

  const handleDeactivateDepartment = async (departmentId) => {
    if (!departmentId) {
      toast.error("Invalid department ID");
      return;
    }

    if (
      !window.confirm("Are you sure you want to deactivate this department?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios({
        method: "PATCH",
        url: `http://localhost:5000/departments/deactivate/${departmentId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Department deactivated successfully");
        await fetchUsers();
      } else {
        throw new Error("Failed to deactivate department");
      }
    } catch (error) {
      console.error("Error deactivating department:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(
            error.response.data?.message || "Failed to deactivate department"
          );
        } else if (error.request) {
          toast.error("No response from server. Please try again.");
        } else {
          toast.error("Error deactivating department");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleView = (id: number) => {};

  const handleDelete = async (id: number) => {
    if (
      window.confirm("Are you sure you want to deactivate this department?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:5000/departments/deactivate/${id}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deactivating department:", error);
        alert("Failed to deactivate department. Please try again.");
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this department?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/departments/activate/${id}`,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchUsers();
      } catch (error) {
        console.error("Error activating user:", error);
        alert("Failed to activate role. Please try again.");
      }
    }
  };

  const handleDeleteSelected = () => {};

  const handleViewSelected = () => {};

  const handleStatusChange = async (e) => {
    try {
      const isActive = e.target.value === "active";
      setShowInactive(!isActive);

      if (isActive) {
        await fetchUsers();
      } else {
        await fetchInactiveUsers();
      }
    } catch (error) {
      console.error("Error changing department status view:", error);
      toast.error("Failed to change department status view");
    }
  };

  const handleCreateDepartment = async () => {
    const token = localStorage.getItem("token");

    try {
      const newDepartment = {};

      const response = await axios.post(
        "http://localhost:5000/departments/create",
        newDepartment,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Department created successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("Failed to create department");
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
            Department Status
          </label>
          <div className="relative mt-20">
            <select
              className="bg-blue-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 hover:bg-blue-500 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
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
        <Link to="/department-registration">
          <button className="bg-blue-600 text-white px-6 py-3 mt-20 rounded-lg hover:bg-blue-500 transition duration-300">
            Add Department
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
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 font-medium text-gray-700 text-left">
                  Department ID
                </th>
                <th className="p-3 font-medium text-gray-700 text-left">
                  Department Name
                </th>
                <th className="p-3 font-medium text-gray-700 text-left">
                  Contact Person
                </th>
                <th className="p-3 font-medium text-gray-700 text-left">
                  Created By
                </th>
                <th className="p-3 font-medium text-gray-700 text-left">
                  Created Date
                </th>
                <th className="p-3 font-medium text-gray-700 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((department) => {
                  return (
                    <tr
                      key={department.departmentId}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-3 text-gray-700">
                        {department.departmentId}
                      </td>
                      <td className="p-3 text-gray-700">
                        {department.departmentName}
                      </td>
                      <td className="p-3 text-gray-700">
                        {department.contactPerson}
                      </td>
                      <td className="p-3 text-gray-700">
                        {department.createdBy || "Unknown"}
                      </td>
                      <td className="p-3 text-gray-700">
                        {department.createdDate}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-3">
                          <Link
                            to={`/view-department/${department.departmentId}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="View"
                          >
                            <Visibility />
                          </Link>
                          {showInactive ? (
                            <button
                              onClick={() =>
                                handleActivateDepartment(
                                  department.departmentId
                                )
                              }
                              className="text-green-600 hover:text-green-800 transition-colors duration-150"
                              title="Activate"
                            >
                              <CheckCircle />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleDeactivateDepartment(
                                  department.departmentId
                                );
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
                        ? "There are currently no inactive departments"
                        : "There are currently no active departments"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between"></div>
        <Footer className="mt-8" />
      </div>
    </div>
  );
};

export default DepartmentManagement;
