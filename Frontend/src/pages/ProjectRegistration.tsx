import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProjectRegistration.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const ProjectRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teamMembers: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleprojectRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Constructing the new project object
    const newProject = {
      // projectId: "P12345", // You may want to generate this dynamically
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      teamMembers: formData.teamMembers,
      status: formData.status,
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Sending request with body:", newProject);

      const response = await fetch("http://localhost:5000/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Project created successfully!");
        console.log("Created Project:", data);
        setFormData({
          name: "",
          description: "",
          teamMembers: "",
          startDate: "",
          endDate: "",
          status: "ACTIVE", // Reset to default status
        });
      } else {
        const errorData = await response.text();
        console.error("Error Response:", errorData);
        toast.error(errorData || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 ${
          isCollapsed ? "ml-8" : "ml-60"
        } mt-10 flex justify-center items-center`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
          <div className="space-y-1 text-center mb-4">
            <h2 className="text-3xl font-light tracking-tight text-gray-900">
              Project Registration
            </h2>
          </div>
          <form onSubmit={handleprojectRegistration}>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Project Name</label>
              </div>
            </div>
            <div className="mt-6"></div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Description</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Team Members</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Start Date</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>End Date</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                >
                   <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ONHOLD">On Hold</option>
              <option value="INACTIVE">Inactive</option>
                </select>
                <span></span>
                <label>Status</label>
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register project"}
              </Button>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default ProjectRegistration;
