import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import { RemoveCircleOutline, CheckCircle, Close } from "@mui/icons-material";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { KeyboardArrowDown } from "@mui/icons-material";

type LeaveDto = {
  leaveRequestId: number;
  userId: number;
  reportingManagerId: number;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: string;
  leaveStatus: string;
};

const EmployeeLeaveManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("sick");
  const [rejectedLeaves, setRejectedLeaves] = useState<LeaveDto[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveDto[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/leaverequests/pending",
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
          return;
        }

        if (error.response) {
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        }
      } else {
        console.error("Non-axios error:", error);
      }
      setUsers([]);
    }
  };

  const fetchInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8081/Leaves/inactive",
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
      console.error("Error fetching inactive Leaves:", error);
      setUsers([]);
    }
  };

  const handleActivateLeave = async (id) => {
    if (!id) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8081/Leaves/activate/${id}`,
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
      console.error("Error activating Leave:", error);
    }
  };

  const handleDeactivateLeave = async (LeaveId) => {
    if (!LeaveId) {
      return;
    }

    if (!window.confirm("Are you sure you want to deactivate this Leave?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios({
        method: "PATCH",
        url: `http://localhost:8081/Leaves/deactivate/${LeaveId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        await fetchUsers();
      } else {
        throw new Error("Failed to deactivate Leave");
      }
    } catch (error) {
      console.error("Error deactivating Leave:", error);
    }
  };

  const fetchRejectedLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/leaverequests/rejected",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRejectedLeaves(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching rejected leaves:", error);
    }
  };

  const fetchApprovedLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/leaverequests/approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovedLeaves(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching approved leaves:", error);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/leaverequests/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
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
    if (window.confirm("Are you sure you want to deactivate this Leave?")) {
      try {
        const response = await fetch(
          `http://localhost:8081/Leaves/deactivate/${id}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deactivating Leave:", error);
        alert("Failed to deactivate Leave. Please try again.");
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this Leave?")) {
      try {
        const response = await fetch(
          `http://localhost:8081/Leaves/activate/${id}`,
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
    const selectedStatus = e.target.value;
    setSelectedStatus(selectedStatus);
    setShowInactive(selectedStatus === "inactive");

    if (selectedStatus === "APPROVED") {
      await fetchApprovedLeaves();
    } else if (selectedStatus === "REJECTED") {
      await fetchRejectedLeaves();
    } else if (selectedStatus === "PENDING") {
      await fetchPendingLeaves();
    }
  };

  const handleCreateLeave = async () => {
    const token = localStorage.getItem("token");

    try {
      const newLeave = {};

      const response = await axios.post(
        "http://localhost:8081/Leaves/create",
        newLeave,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchUsers();
    } catch (error) {
      console.error("Error creating Leave:", error);
    }
  };

  const handleLeaveTypeChange = (e) => {
    setSelectedLeaveType(e.target.value);
  };

  const handleApproveLeave = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/manager/leaveRequest/${id}/updateStatus?status=APPROVED`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const handleRejectLeave = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/manager/leaveRequest/${id}/updateStatus?status=REJECTED`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
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
            Leave Status
          </label>
          <div className="relative mt-20">
            <select
              className="bg-purple-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 hover:bg-purple-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white text-sm">
              <KeyboardArrowDown />
            </span>
          </div>
        </div>
        <Link to="/leave-balance">
          <button className="bg-purple-600 text-white px-6 py-3 mt-20 rounded-lg hover:bg-violet-700 transition duration-300">
            Leave Balance
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
                  Leave Request ID
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Employee ID
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Reporting Manager ID
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Leave Start Date
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Leave End Date
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Leave Type
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Leave Status
                </th>
                <th className="p-3 font-semibold text-white text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((Leave, index) => {
                  return (
                    <tr
                      key={`${Leave.leaveRequestId}-${index}`}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-3 text-gray-700">
                        {Leave.leaveRequestId}
                      </td>
                      <td className="p-3 text-gray-700">{Leave.userId}</td>
                      <td className="p-3 text-gray-700">
                        {Leave.reportingManagerId}
                      </td>
                      <td className="p-3 text-gray-700">
                        {Leave.leaveStartDate}
                      </td>
                      <td className="p-3 text-gray-700">
                        {Leave.leaveEndDate}
                      </td>
                      <td className="p-3 text-gray-700">{Leave.leaveType}</td>
                      <td className="p-3 text-gray-700">{Leave.leaveStatus}</td>
                      <td className="p-3">
                        <div className="flex space-x-3">
                          <Link
                            to={`/view-Leave/${Leave.leaveRequestId}`}
                            className="text-purple-600 hover:text-purple-800 transition-colors duration-150"
                            title="View"
                          >
                            <Visibility />
                          </Link>
                          <button
                            onClick={() =>
                              handleApproveLeave(Leave.leaveRequestId)
                            }
                            className="text-green-600 hover:text-green-800 transition-colors duration-150"
                            title="Approve"
                          >
                            <CheckCircle />
                          </button>
                          <button
                            onClick={() =>
                              handleRejectLeave(Leave.leaveRequestId)
                            }
                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                            title="Reject"
                          >
                            <Close />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="text-gray-500">
                      {showInactive
                        ? "There are currently no inactive Leaves"
                        : "There are currently no active Leaves"}
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

export default EmployeeLeaveManagement;
