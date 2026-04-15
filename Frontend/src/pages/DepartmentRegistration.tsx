import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./DepartmentRegistration.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const DepartmentRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    contactPerson: "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDepartmentRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requestBody = {
      departmentName: formData.department,
      contactPerson: formData.contactPerson,
      createdBy: "",
      updatedBy: "",
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Sending request with body:", requestBody);

      const response = await fetch("http://localhost:5000/departments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 201) {
        const data = await response.json();
        toast.success("Department created successfully!");
        setFormData({ department: "", contactPerson: "" });
      } else {
        const errorData = await response.text();
        console.error("Error Response:", errorData);
        toast.error(errorData || "Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("Failed to create department. Please try again.");
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
            <h2 className="text-2xl font-bold tracking-tight text-violet-900">
              Department Registration
            </h2>
          </div>
          <form onSubmit={handleDepartmentRegistration}>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Department Name</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Contact Person</label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Department"}
              </Button>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default DepartmentRegistration;
