import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ViewDepartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/departments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetched department data:", response.data);
        setDepartment(response.data);
      } catch (err) {
        console.error("Error fetching department details:", err);
        setError("Failed to load department details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentDetails();
  }, [id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDepartment((prevDepartment) => ({ ...prevDepartment, [name]: value }));
  };

  const handleSaveDepartment = async () => {
    if (department) {
      try {
        const token = localStorage.getItem("token");
        const updateRequest = {
          departmentName: department.departmentName,
          contactPerson: department.contactPerson,
        };

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.put(
          `http://localhost:5000/departments/update/${id}`,
          updateRequest,
          { headers }
        );

        toast.success("Department updated successfully!");
        setIsEditing(false);
        setDepartment(response.data);
      } catch (err) {
        console.error("Error updating department:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to update department: ${err.response.data}`);
        } else {
          toast.error("Failed to update department. Please try again later.");
        }
      }
    }
  };

  if (loading) return <p>Loading department details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-blue-50 shadow-lg rounded-lg p-8 w-1/2 ml-40 mt-20 mb-20">
        <DashboardSidebar isCollapsed={isCollapsed} />
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSaveDepartment}
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
          Department Details
        </h2>
        {department ? (
          <div className="space-y-4 mt-4">
            <div>
              <strong>Department Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="departmentName"
                  value={department.departmentName || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {department.departmentName || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Contact Person:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="contactPerson"
                  value={department.contactPerson || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px] bg-white"
                />
              ) : (
                <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                  {department.contactPerson || "N/A"}
                </div>
              )}
            </div>
            <div>
              <strong>Created By:</strong>
              <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                {department.createdBy || "N/A"}
              </div>
            </div>
            <div>
              <strong>Created Date:</strong>
              <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                {department.createdDate
                  ? new Date(department.createdDate).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div>
              <strong>Status:</strong>
              <div className="border rounded p-2 bg-gray-100 min-h-[40px]">
                {department.active !== undefined
                  ? department.active
                    ? "Active"
                    : "Inactive"
                  : "N/A"}
              </div>
            </div>
          </div>
        ) : (
          <p>No department details available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewDepartment;
