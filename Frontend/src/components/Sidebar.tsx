import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Home,
  LogOut,
  UserCog,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const [isEmployeeManagementOpen, setIsEmployeeManagementOpen] =
    useState(false);
  const [isLeaveManagementOpen, setIsLeaveManagementOpen] = useState(false);

  const handleHomeClick = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Logout failed: No authentication token found");
      return;
    }
    // Clear all auth-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("google_credential");
    localStorage.removeItem("username");
    localStorage.removeItem("creatorName");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleDocumentsClick = () => {
    navigate("/documents");
  };

  const handleEmployeeManagementClick = () => {
    setIsEmployeeManagementOpen(!isEmployeeManagementOpen);
  };

  const handleEmployeeListClick = () => {
    navigate("/EmployeeList");
  };

  const handleRoleManagementClick = () => {
    navigate("/role-management");
  };

  const handleDepartmentManagementClick = () => {
    navigate("/department-management");
  };

  const handleLeaveManagementClick = () => {
    setIsLeaveManagementOpen((prev) => !prev);
  };

  const handleProjectManagementClick = () => {
    navigate("/project-management");
  };

  const handleTimeSheetManagementClick = () => {
    navigate("/time-sheet-management");
  };

  const handleAttendanceManagementClick = () => {
    navigate("/attendance-management");
  };

  const handlePayRoleManagementClick = () => {
    navigate("/payroll-management");
  };

  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));
  const isManager = userRoles.includes("MANAGER");

  const allMenuItems = [
    { icon: Home, label: "Home", onClick: handleHomeClick, roles: "ALL" },
    {
      icon: UserCog, label: "Employee Management", onClick: handleEmployeeManagementClick,
      roles: "ADMIN_HR",
      submenu: [{ icon: Users, label: "Employee List", onClick: handleEmployeeListClick }],
      isOpen: isEmployeeManagementOpen,
    },
    { icon: UserCog, label: "Role Management", onClick: handleRoleManagementClick, roles: "ADMIN_HR" },
    { icon: Users, label: "Department Management", onClick: handleDepartmentManagementClick, roles: "ADMIN_HR" },
    {
      icon: FileText, label: "Leave Management", onClick: handleLeaveManagementClick,
      roles: "ALL",
      submenu: [
        { icon: Users, label: "Apply Leave", onClick: () => navigate("/leave-application") },
        ...(isAdminOrHR || isManager ? [
          { icon: Users, label: "Manage Leaves", onClick: () => navigate("/employee-leave-management") },
        ] : []),
        { icon: Users, label: "Leave Balance", onClick: () => navigate("/leave-balance") },
      ],
      isOpen: isLeaveManagementOpen,
    },
    { icon: Home, label: "Project Management", onClick: handleProjectManagementClick, roles: "ADMIN_HR" },
    { icon: Clock, label: "Timesheet", onClick: handleTimeSheetManagementClick, roles: "ADMIN_HR" },
    { icon: Users, label: "Attendance", onClick: handleAttendanceManagementClick, roles: "ALL" },
    { icon: DollarSign, label: "Payroll", onClick: handlePayRoleManagementClick, roles: "ALL" },
    { icon: Calendar, label: "Events", onClick: () => navigate("/events"), roles: "ALL" },
    { icon: FileText, label: "Documents", onClick: handleDocumentsClick, roles: "ALL" },
    { icon: LogOut, label: "Logout", onClick: handleLogout, roles: "ALL" },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.roles === "ALL") return true;
    if (item.roles === "ADMIN_HR") return isAdminOrHR;
    return false;
  });
  return (
    <div
      className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gradient-to-b from-gray-50 to-blue-50 backdrop-blur-md border-r border-gray-200 sidebar-transition ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            <Button
              variant="ghost"
              className="justify-start w-full text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={item.onClick}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && (
                <>
                  <span className="ml-2 flex-1 text-left">{item.label}</span>
                  {item.submenu && (
                    <span className="ml-2">
                      {isEmployeeManagementOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </>
              )}
            </Button>

            {/* Submenu */}
            {!isCollapsed && item.submenu && item.isOpen && (
              <div className="ml-4 mt-2 space-y-2">
                {item.submenu.map((subItem) => (
                  <Button
                    key={subItem.label}
                    variant="ghost"
                    className="justify-start w-full pl-6 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={subItem.onClick}
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span className="ml-2">{subItem.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
