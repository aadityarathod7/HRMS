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
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

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
        setDepartment(response.data);
      } catch (err) {
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
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}><div className="pt-28 px-5 pb-5 flex-grow flex justify-center items-start"><div className="w-full max-w-2xl mb-20"><div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                onClick={handleSaveDepartment}
              >
                Save
              </button>
              <button
                className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm ml-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
              onClick={() => isAdminOrHR && setIsEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm ml-2"
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
                  ? new Date(department.createdDate).toLocaleDateString('en-GB')
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
      </div>
      </div>
    </div>
  );
};

export default ViewDepartment;
