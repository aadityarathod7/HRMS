import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LeaveApplication.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const LeaveApplication = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    reportingManagerId: "",
    leaveStartDate: "",
    leaveEndDate: "",
    leaveType: "",
    description: "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleleaveRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requestBody = {
      userId: formData.userId,
      reportingManagerId: formData.reportingManagerId,
      leaveStartDate: formData.leaveStartDate,
      leaveEndDate: formData.leaveEndDate,
      leaveType: formData.leaveType,
      description: formData.description,
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Sending request with body:", requestBody);

      const response = await fetch(
        "http://localhost:5000/leaverequests/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.status === 201) {
        const data = await response.json();
        toast.success("leave created successfully!");
        setFormData({
          userId: null,
          reportingManagerId: null,
          leaveStartDate: "",
          leaveEndDate: "",
          leaveType: "",
          description: "",
        });
      } else {
        const errorData = await response.text();
        console.error("Error Response:", errorData);
        toast.error(errorData || "Failed to create leave");
      }
    } catch (error) {
      console.error("Error creating leave:", error);
      toast.error("Failed to create leave. Please try again.");
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
              Leave Application
            </h2>
          </div>
          <form onSubmit={handleleaveRegistration}>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>User ID</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="reportingManagerId"
                  value={formData.reportingManagerId}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Reporting Manager ID</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="date"
                  name="leaveStartDate"
                  value={formData.leaveStartDate}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Leave Start Date</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="date"
                  name="leaveEndDate"
                  value={formData.leaveEndDate}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Leave End Date</label>
              </div>
            </div>
            <div className="mt-6">
              <div className="txt_field">
                <input
                  type="text"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full h-40px bg-transparent"
                />
                <span></span>
                <label>Leave Type</label>
              </div>
            </div>
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
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Registering..." : "Apply Leave"}
              </Button>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;
