import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import { CheckCircle, Close, RemoveCircleOutline } from "@mui/icons-material";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { KeyboardArrowDown } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type LeaveDto = {
  id: string;
  userId: number;
  reportingManagerId: number;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: string;
  leaveStatus: string;
};

const LeaveManagement: React.FC = () => {
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

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/leaverequests/pending`,
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
        } else if (error.request) {
        }
      } else {
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
          `${API_URL}/Leaves/inactive`,
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
        `${API_URL}/Leaves/activate/${id}`,
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
        url: `${API_URL}/Leaves/deactivate/${LeaveId}`,
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
    }
  };

  const fetchRejectedLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/leaverequests/rejected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRejectedLeaves(response.data);
      setUsers(response.data);
    } catch (error) {
    }
  };

  const fetchApprovedLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/leaverequests/approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovedLeaves(response.data);
      setUsers(response.data);
    } catch (error) {
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/leaverequests/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
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
    if (window.confirm("Are you sure you want to delete this Leave request?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `${API_URL}/leaverequests/delete/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 204) {
          setUsers(users.filter((user) => user.id !== id));
        } else {
          throw new Error("Failed to delete Leave request");
        }
      } catch (error) {
        alert("Failed to delete Leave request. Please try again.");
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (window.confirm("Are you sure you want to activate this Leave?")) {
      try {
        const response = await fetch(
          `${API_URL}/Leaves/activate/${id}`,
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
        `${API_URL}/Leaves/create`,
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
    }
  };

  const handleLeaveTypeChange = (e) => {
    setSelectedLeaveType(e.target.value);
  };

  const handleApproveLeave = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/Leaves/approve/${id}`,
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
    }
  };

  const handleRejectLeave = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/Leaves/reject/${id}`,
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
    }
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
          <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm">
            Leave Balance
          </button>
        </Link>
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
                  Employee
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Period
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Days
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
                users.map((Leave, index) => {
                  return (
                    <tr
                      key={`${Leave.id}-${index}`}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-gray-800 text-sm">
                        {typeof Leave.userId === "object" ? `${Leave.userId.firstname} ${Leave.userId.lastname}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(Leave.leaveStartDate).toLocaleDateString('en-GB')} — {new Date(Leave.leaveEndDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{Leave.leaveType}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{Leave.numberOfDays || 1} day(s)</td>
                      <td className="px-4 py-3">{Leave.leaveStatus}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3">
                          <Link
                            to={`/view-Leave/${Leave.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="View"
                          >
                            <Visibility />
                          </Link>
                          {selectedStatus === "PENDING" && (
                            <button
                              onClick={() => isAdminOrHR && handleDelete(Leave.id)}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </button>
                          )}
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

export default LeaveManagement;
