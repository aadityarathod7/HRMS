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

const ViewEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/user/${id}`, {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (user) {
      try {
        const token = localStorage.getItem("token");
        const createUserRequest = {
          firstname: user.firstname,
          lastname: user.lastname,
          userName: user.userName,
          dob: user.dob,
          contactNumber: user.contactNumber,
          email: user.email,
          branch: user.branch,
          bloodGroup: user.bloodGroup,
          dateOfJoining: user.dateOfJoining,
          isActive: user.isActive,
          address: user.address,
          gender: user.gender,
          roles: user.roles.map((role) => role.value),
        };

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        await axios.put(
          `http://localhost:5000/user/update/${id}`,
          createUserRequest,
          { headers }
        );
        toast.success("User updated successfully!");
        setIsEditing(false);
        const updatedUser = await axios.get(
          `http://localhost:5000/user/${id}`,
          { headers }
        );
        setUser(updatedUser.data);
      } catch (err) {
        console.error("Error updating user:", err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(`Failed to update user: ${err.response.data}`);
        } else {
          toast.error("Failed to update user. Please try again later.");
        }
      }
    }
  };

  if (loading) return <p>Loading Employee details...</p>;
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
          Employee Details
        </h2>
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div>
                <strong>First Name:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstname"
                    value={user.firstname}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.firstname || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Last Name:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastname"
                    value={user.lastname}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.lastname || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Username:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="userName"
                    value={user.userName}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.userName || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Email:</strong>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.email || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Phone:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactNumber"
                    value={user.contactNumber}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.contactNumber || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Address:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={user.address}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.address || "N/A"}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Branch:</strong>
                {isEditing ? (
                  <select
                    name="branch"
                    value={user.branch}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  >
                    <option value="">Select Branch</option>
                    {AVAILABLE_BRANCHES.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="min-h-[40px]">{user.branch || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Blood Group:</strong>
                {isEditing ? (
                  <select
                    name="bloodGroup"
                    value={user.bloodGroup}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  >
                    <option value="">Select Blood Group</option>
                    {AVAILABLE_BLOOD_GROUPS.map((bloodGroup) => (
                      <option key={bloodGroup.value} value={bloodGroup.value}>
                        {bloodGroup.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="min-h-[40px]">{user.bloodGroup || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Date of Birth:</strong>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={user.dob}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.dob || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Date of Joining:</strong>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={user.dateOfJoining}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  />
                ) : (
                  <p className="min-h-[40px]">{user.dateOfJoining || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Gender:</strong>
                {isEditing ? (
                  <select
                    name="gender"
                    value={user.gender}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full min-h-[40px]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <p className="min-h-[40px]">{user.gender || "N/A"}</p>
                )}
              </div>
              <div>
                <strong>Roles:</strong>
                {isEditing ? (
                  <select
                    name="roles"
                    value={user.roles.length > 0 ? user.roles[0].value : ""}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      setUser((prevUser) => ({
                        ...prevUser,
                        roles: [
                          {
                            value: selectedRole,
                            label: roleLabels[selectedRole],
                          },
                        ],
                      }));
                    }}
                    className="border rounded p-2 w-full min-h-[40px]"
                  >
                    <option value="">Select Role</option>
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="min-h-[40px]">
                    {user.roles.length > 0
                      ? user.roles.map((role) => role.label).join(", ")
                      : "No Roles"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>No user details available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewEmployee;
