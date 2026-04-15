import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AVAILABLE_ROLES = [
  { value: "ROLE_USER", label: "User" },
  { value: "ROLE_ADMIN", label: "Admin" },
  // Add other roles as needed
];

const AVAILABLE_BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const AVAILABLE_BRANCHES = [
  { value: "IT", label: "Information Technology" },
  { value: "HR", label: "Human Resources" },
  { value: "BA", label: "Business Analysis" },
  { value: "FINANCE", label: "Finance" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "MARKETING", label: "Marketing" },
];

const roleLabels = {
  ROLE_USER: "User",
  ROLE_ADMIN: "Admin",
  // Add other roles as needed
};

const ViewRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<{
    id?: number;
    role?: string;
    description?: string;
    createdBy?: string;
    createdDate?: string;
    roleMenuActions?: any[];
    active?: boolean;
    updatedBy?: string;
    updatedDate?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/role/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate role input to allow only uppercase letters
    if (name === "role") {
      if (!/^[A-Z]*$/.test(value)) {
        // Allow empty input as well
        setRoleError("Please enter only uppercase alphabets.");
        return; // Do not update state if the input is invalid
      } else {
        setRoleError(""); // Clear error if input is valid
      }
    }

    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const updateRoleRequest = {
          role: user.role,
          description: user.description,
        };

        console.log("Updating role with payload:", updateRoleRequest);

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.put(
          `http://localhost:5000/role/update/${id}`,
          updateRoleRequest,
          { headers }
        );

        console.log("Response from update:", response.data);

        toast.success("Role updated successfully!");
        setIsEditing(false);
        const updatedUser = await axios.get(
          `http://localhost:5000/role/${id}`,
          { headers }
        );
        setUser(updatedUser.data);
      } catch (err) {
        console.error("Error updating role:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to update role: ${err.response.data}`);
        } else {
          toast.error("Failed to update role. Please try again later.");
        }
      }
    }
  };

  const handleDeactivateRole = async () => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        await axios.put(
          `http://localhost:5000/role/deactivate/${user.id}`,
          {},
          { headers }
        );

        toast.success("Role deactivated successfully!");
        // Optionally, you can fetch the updated user data or handle state changes here
      } catch (err) {
        console.error("Error deactivating role:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to deactivate role: ${err.response.data}`);
        } else {
          toast.error("Failed to deactivate role. Please try again later.");
        }
      }
    }
  };

  const handleActivateRole = async () => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        console.log(`Activating role for user ID: ${user.id}`);

        const response = await axios.put(
          `http://localhost:5000/role/activate/${user.id}`,
          {},
          { headers }
        );
        console.log("Activation response:", response.data);

        toast.success("Role activated successfully!");
        // Optionally, you can fetch the updated user data or handle state changes here
      } catch (err) {
        console.error("Error activating role:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to activate role: ${err.response.data}`);
        } else {
          toast.error("Failed to activate role. Please try again later.");
        }
      }
    } else {
      console.error("User is not defined.");
    }
  };

  if (loading) return <p>Loading role details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>No role details found.</p>;

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
      <div className="bg-blue-50 shadow-lg rounded-lg p-8 w-1/2 ml-40 mt-20 mb-20">
        <DashboardSidebar isCollapsed={isCollapsed} />
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSaveUser}
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded"
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
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          Role Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <strong>Role:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={user?.role || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px]"
                />
              ) : (
                <p className="min-h-[40px]">{user?.role || "No Role"}</p>
              )}
              {roleError && (
                <div className="text-red-500 mt-1">{roleError}</div>
              )}
            </div>
            <div>
              <strong>Description:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="description"
                  value={user?.description || ""}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full min-h-[40px]"
                />
              ) : (
                <p className="min-h-[40px]">
                  {user?.description || "No Description"}
                </p>
              )}
            </div>
            {user?.createdBy && (
              <div>
                <strong>Created By:</strong>
                <p className="min-h-[40px]">{user.createdBy}</p>
              </div>
            )}
            {user?.createdDate && (
              <div>
                <strong>Created Date:</strong>
                <p className="min-h-[40px]">
                  {new Date(user.createdDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {user?.active !== undefined && (
              <div>
                <strong>Status:</strong>
                <p className="min-h-[40px]">
                  {user.active ? "Active" : "Inactive"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRole;
