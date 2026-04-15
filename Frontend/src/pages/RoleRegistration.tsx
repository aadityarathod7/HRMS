import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

const RoleRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    description: "",
    isActive: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setFormData((prevData) => ({
        ...prevData,
        createdBy: username,
        updatedBy: username,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && !/^[A-Z]*$/.test(value)) {
      setRoleError("Please enter only uppercase alphabets.");
      return;
    }
    setRoleError("");
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      setLoading(false);
      return;
    }

    const requestBody = {
      role: formData.role,
      description: formData.description,
      createdBy: "",
      updatedBy: "",
      active: true,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/role/create",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Role Added Successfully");
        setFormData({
          role: "",
          description: "",
          isActive: false,
        });
        
        // Optionally navigate back to role management after successful creation
        setTimeout(() => {
          navigate("/role-management");
        }, 2000);
      } else {
        throw new Error("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setErrorMessage(error.response.data?.message || "Failed to create role");
          toast.error(error.response.data?.message || "Failed to create role");
        } else if (error.request) {
          setErrorMessage("No response from server. Please try again.");
          toast.error("No response from server. Please try again.");
        } else {
          setErrorMessage("An error occurred. Please try again.");
          toast.error("An error occurred. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isCollapsed={isCollapsed} />
      <div
        className={`flex-1 ${
          isCollapsed ? "ml-8" : "ml-60"
        } mt-10 flex justify-center items-center`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-light tracking-tight text-gray-900 text-center mb-4">
            Add Role
          </h2>
          <form onSubmit={handleRoleRegistration}>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <label>Role</label>
              </div>
              {roleError && (
                <div className="text-red-500 mt-1">{roleError}</div>
              )}
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <label>Description</label>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <Button
                type="submit"
                className="w-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Adding role..." : "Add Role"}
              </Button>
              <Button
                type="button"
                className="w-1/2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-300"
                onClick={() => navigate("/role-management")}
              >
                Cancel
              </Button>
            </div>
          </form>
          {errorMessage && (
            <div className="text-red-500 mt-4">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleRegistration;