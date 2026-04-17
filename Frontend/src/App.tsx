import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { ToastProvider } from "@/context/ToastContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleCallback from "./pages/auth/google/callback";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import EmployeeList from "./pages/EmployeeList";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import ViewEmployee from "./pages/ViewEmployee";
import RoleManagement from "./pages/RoleManagement";
import RoleRegistration from "./pages/RoleRegistration";
import ViewRole from "./pages/ViewRole";
import DepartmentManagement from "./pages/DepartmentManagement";
import DepartmentRegistration from "./pages/DepartmentRegistration";
import ViewDepartment from "./pages/ViewDepartment";
import LeaveApplication from "./pages/LeaveApplication";
import LeaveManagement from "./pages/LeaveManagement";
import EmployeeLeaveManagement from "./pages/EmployeeLeaveManagement";
import LeaveBalance from "./pages/LeaveBalance";
import ViewLeave from "./pages/ViewLeave";
import ProjectManagement from "./pages/ProjectManagement";
import ProjectRegistration from "./pages/ProjectRegistration";
import ViewProject from "./pages/ViewProject";
import TimeSheetManagement from "./pages/TimeSheetManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import PayrollManagement from "./pages/PayrollManagement";
import Documents from "./pages/Documents";
import View from "./pages/View";
import Events from "./pages/Events";

const queryClient = new QueryClient();
const ADMIN_HR = ["ADMIN", "HR"];
const ADMIN_HR_MGR = ["ADMIN", "HR", "MANAGER"];

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <Toaster />
          <Sonner />
          <ToastContainer
            toastStyle={{
              backgroundColor: "white", color: "#1e40af",
              fontFamily: "var(--font-system)", fontWeight: 300,
              borderRadius: "8px", border: "1px solid #dbeafe",
            }}
            progressStyle={{ background: "#2563eb" }}
            icon={({ type }) => {
              if (type === "success") return <span style={{ color: "#2563eb", fontSize: "18px" }}>✓</span>;
              if (type === "error") return <span style={{ color: "#dc2626", fontSize: "18px" }}>✕</span>;
              return null;
            }}
            position="bottom-right"
            autoClose={3000}
          />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Protected — All logged-in users */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/leave-application" element={<ProtectedRoute><LeaveApplication /></ProtectedRoute>} />
              <Route path="/leave-balance" element={<ProtectedRoute><LeaveBalance /></ProtectedRoute>} />
              <Route path="/view-leave/:id" element={<ProtectedRoute><ViewLeave /></ProtectedRoute>} />
              <Route path="/view-employee/:id" element={<ProtectedRoute><ViewEmployee /></ProtectedRoute>} />
              <Route path="/attendance-management" element={<ProtectedRoute><AttendanceManagement /></ProtectedRoute>} />
              <Route path="/payroll-management" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/view/:id" element={<ProtectedRoute><View /></ProtectedRoute>} />

              {/* Protected — Admin, HR, Manager only */}
              <Route path="/employeelist" element={<ProtectedRoute allowedRoles={ADMIN_HR}><EmployeeList /></ProtectedRoute>} />
              <Route path="/employeeregistration" element={<ProtectedRoute allowedRoles={ADMIN_HR}><EmployeeRegistration /></ProtectedRoute>} />
              <Route path="/role-management" element={<ProtectedRoute allowedRoles={ADMIN_HR}><RoleManagement /></ProtectedRoute>} />
              <Route path="/roleregistration" element={<ProtectedRoute allowedRoles={ADMIN_HR}><RoleRegistration /></ProtectedRoute>} />
              <Route path="/view-role/:id" element={<ProtectedRoute allowedRoles={ADMIN_HR}><ViewRole /></ProtectedRoute>} />
              <Route path="/department-management" element={<ProtectedRoute allowedRoles={ADMIN_HR}><DepartmentManagement /></ProtectedRoute>} />
              <Route path="/department-registration" element={<ProtectedRoute allowedRoles={ADMIN_HR}><DepartmentRegistration /></ProtectedRoute>} />
              <Route path="/view-department/:id" element={<ProtectedRoute allowedRoles={ADMIN_HR}><ViewDepartment /></ProtectedRoute>} />
              <Route path="/leave-management" element={<ProtectedRoute allowedRoles={ADMIN_HR_MGR}><LeaveManagement /></ProtectedRoute>} />
              <Route path="/employee-leave-management" element={<ProtectedRoute allowedRoles={ADMIN_HR_MGR}><EmployeeLeaveManagement /></ProtectedRoute>} />
              <Route path="/project-management" element={<ProtectedRoute allowedRoles={ADMIN_HR}><ProjectManagement /></ProtectedRoute>} />
              <Route path="/project-registration" element={<ProtectedRoute allowedRoles={ADMIN_HR}><ProjectRegistration /></ProtectedRoute>} />
              <Route path="/view-project/:id" element={<ProtectedRoute allowedRoles={ADMIN_HR}><ViewProject /></ProtectedRoute>} />
              <Route path="/time-sheet-management" element={<ProtectedRoute allowedRoles={ADMIN_HR}><TimeSheetManagement /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
