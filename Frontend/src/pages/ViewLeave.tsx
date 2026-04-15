import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LeaveRequest {
  userId: string;
  reportingManagerId: string;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: string;
  description: string;
  leaveStatus: string;
}

const ViewLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/leaverequests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetched leave data:", response.data);
        setLeave(response.data);
      } catch (err) {
        console.error("Error fetching leave details:", err);
        setError("Failed to load leave details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeave((prevLeave) => ({ ...prevLeave, [name]: value }));
  };

  const handleSaveLeave = async () => {
    if (leave) {
      try {
        const token = localStorage.getItem("token");
        const updateRequest = {
          userId: leave.userId,
          reportingManagerId: leave.reportingManagerId,
          leaveStartDate: leave.leaveStartDate,
          leaveEndDate: leave.leaveEndDate,
          leaveType: leave.leaveType,
          description: leave.description,
          leaveStatus: leave.leaveStatus,
        };

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.put(
          `http://localhost:5000/leaverequests/update/${id}`,
          updateRequest,
          { headers }
        );

        toast.success("Leave updated successfully!");
        setIsEditing(false);
        setLeave(response.data);
      } catch (err) {
        console.error("Error updating leave:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to update leave: ${err.response.data}`);
        } else {
          toast.error("Failed to update leave. Please try again later.");
        }
      }
    }
  };

  if (loading) return <p>Loading leave details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-green !text-violet mt-10"
      />
      <div className="bg-purple-100 shadow-lg rounded-lg p-8 w-1/2 ml-40 mt-20 mb-20">
        <DashboardSidebar isCollapsed={isCollapsed} />
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSaveLeave}
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
              className="bg-purple-600 text-white px-4 py-2 rounded"
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
        <h2 className="text-2xl font-bold tracking-tight text-violet-900 mb-4">
          Leave Details
        </h2>
        {leave ? (
          <div className="space-y-4 mt-4">
            <div>
              <strong>User ID:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="userId"
                  value={leave.userId || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.userId || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Reporting Manager ID:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="reportingManagerId"
                  value={leave.reportingManagerId || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.reportingManagerId || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Leave Start Date:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="leaveStartDate"
                  value={leave.leaveStartDate || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.leaveStartDate || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Leave End Date:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="leaveEndDate"
                  value={leave.leaveEndDate || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.leaveEndDate || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Leave Type:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="leaveType"
                  value={leave.leaveType || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.leaveType || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Description:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="description"
                  value={leave.description || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {leave.description || "N/A"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>No leave details available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewLeave;
