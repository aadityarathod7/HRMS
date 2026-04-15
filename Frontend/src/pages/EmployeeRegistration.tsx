import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; //
import "./EmployeeRegistration.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const AVAILABLE_ROLES = [
  { value: "ROLE_USER", label: "User" },
  { value: "ROLE_ADMIN", label: "Admin" },
];

const AVAILABLE_BRANCH = [
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

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    dob: "",
    bloodGroup: "",
    branch: "",
    dateOfJoining: "",
    gender: "",
    address: "",
    contactNumber: "",
    userName: "",
    password: "",
    roles: [
      { value: "ROLE_USER", label: "User" },
      { value: "ROLE_ADMIN", label: "Admin" },
    ],
    email: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleEmployeeRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = localStorage.getItem("username");

    const requestBody = {
      ...formData,
      roles: formData.roles.length > 0 ? formData.roles : ["ROLE_USER"],
      createdBy: username,
    };

    try {
      const response = await fetch("http://localhost:5000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Employee Registered");
        setFormData({
          firstname: "",
          lastname: "",
          dob: "",
          bloodGroup: "",
          branch: "",
          dateOfJoining: "",
          gender: "",
          address: "",
          contactNumber: "",
          userName: "",
          password: "",
          roles: [],
          email: "",
        });
        navigate("/employeelist");
      } else {
        const errorMessage = await response.text();
        setErrorMessage(errorMessage);
        toast.error("Signup failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <style jsx>{`
        .txt_field input:focus,
        .txt_field select:focus {
          outline: none;
          box-shadow: none;
        }

        .txt_field input:-webkit-autofill,
        .txt_field input:-webkit-autofill:hover,
        .txt_field input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset;
        }
      `}</style>
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
              Employee Registration
            </h2>
          </div>
          <form onSubmit={handleEmployeeRegistration}>
            <div className="grid grid-cols-2 gap-x-6">
              {/* First Column */}
              <div>
                <div className="txt_field">
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>First Name</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    name="dob"
                    value={formData.dob}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.type = "text";
                      }
                    }}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Date Of Birth</label>
                </div>

                <div className="txt_field">
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full h-40px bg-transparent"
                  >
                    <option value=""></option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <span></span>
                  <label>Blood Group</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.type = "text";
                      }
                    }}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Date of Joining</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Username</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Address</label>
                </div>
              </div>

              {/* Second Column */}
              <div>
                <div className="txt_field">
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Last Name</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Contact Number</label>
                </div>

                <div className="txt_field">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full h-40px bg-transparent"
                  >
                    <option value=""></option>
                    {AVAILABLE_BRANCH.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <span></span>
                  <label>Department</label>
                </div>
                <div className="txt_field">
                  <select
                    name="roles"
                    value={formData.roles[0] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roles: [e.target.value],
                      })
                    }
                    required
                    className="w-full h-40px bg-transparent"
                  >
                    <option value=""></option>
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <span></span>
                  <label>Role</label>
                </div>

                <div className="txt_field">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full h-40px bg-transparent"
                  >
                    <option value=""></option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <span></span>
                  <label>Gender</label>
                </div>

                <div className="txt_field">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  <label>Password</label>
                </div>

                <div className="txt_field">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label>Email</label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Register Employee"}
              </Button>
            </div>
          </form>
          {errorMessage && (
            <div className="text-red-500 mt-4">{errorMessage}</div>
          )}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
