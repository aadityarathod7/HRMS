import { Button } from "@/components/ui/button";
import { MenuIcon, Search, User, Bell, LogOut, X, Settings, FileText, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { toast } from "react-toastify";

interface Notification {
  message: string;
  timestamp: string;
  type?: string;
}

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isNotificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const username = localStorage.getItem("username") || "User";

  const toggleDropdown = () => { setDropdownVisible(!isDropdownVisible); setSearchOpen(false); setNotificationPanelVisible(false); };
  const toggleNotificationPanel = () => { setNotificationPanelVisible(!isNotificationPanelVisible); setDropdownVisible(false); setSearchOpen(false); if (isNotificationPanelVisible) setUnreadCount(0); };
  const toggleSearch = () => { setSearchOpen(!isSearchOpen); setDropdownVisible(false); setNotificationPanelVisible(false); setTimeout(() => searchInputRef.current?.focus(), 100); };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("google_credential");
    localStorage.removeItem("username");
    localStorage.removeItem("creatorName");
    localStorage.removeItem("roles");
    localStorage.removeItem("userProfile");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Search navigation
  const searchItems = [
    { label: "Home / Dashboard", path: "/home", keywords: "home dashboard" },
    { label: "Employee List", path: "/employeelist", keywords: "employee list people staff" },
    { label: "Register Employee", path: "/employeeregistration", keywords: "register add new employee" },
    { label: "Role Management", path: "/role-management", keywords: "role roles permissions" },
    { label: "Department Management", path: "/department-management", keywords: "department dept" },
    { label: "Apply Leave", path: "/leave-application", keywords: "apply leave request" },
    { label: "Leave Management", path: "/leave-management", keywords: "leave manage approve reject" },
    { label: "Leave Balance", path: "/leave-balance", keywords: "leave balance remaining" },
    { label: "Project Management", path: "/project-management", keywords: "project projects" },
    { label: "Timesheet", path: "/time-sheet-management", keywords: "timesheet time hours" },
    { label: "Attendance", path: "/attendance-management", keywords: "attendance clock checkin checkout" },
    { label: "Payroll", path: "/payroll-management", keywords: "payroll salary pay" },
    { label: "Documents", path: "/documents", keywords: "documents files upload" },
  ];

  const filteredSearch = searchQuery.trim()
    ? searchItems.filter(item => `${item.label} ${item.keywords}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // WebSocket notifications — single connection, no auto-reconnect spam
  useEffect(() => {
    let socket: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      // Close existing socket before creating new one
      if (socket && socket.readyState <= 1) {
        try { socket.close(); } catch (e) {}
      }

      try {
        socket = new WebSocket(`${import.meta.env.VITE_WS_URL || "ws://localhost:5000"}/leaveNotification`);

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            const myRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
            let myId = JSON.parse(localStorage.getItem("userProfile") || "{}").id;
            if (!myId) {
              try { const t = localStorage.getItem("token"); if (t) myId = JSON.parse(atob(t.split(".")[1])).id; } catch (e) {}
            }

            const { forRoles = [], forUser, forAll } = parsed;
            const matchesRole = forRoles.length > 0 && myRoles.some(r => forRoles.includes(r));
            const matchesUser = forUser && myId && forUser === myId;
            if (!forAll && !matchesRole && !matchesUser) return;

            // Pick the right message: personal for user, informational for role
            const msg = matchesUser && parsed.userMessage ? parsed.userMessage : parsed.roleMessage || parsed.message || event.data;
            setNotifications(prev => [{ message: msg, timestamp: new Date().toLocaleTimeString(), type: parsed.type || "info" }, ...prev]);
            setUnreadCount(prev => prev + 1);
          } catch (e) {}
        };

        socket.onclose = () => {
          if (!closed && localStorage.getItem("token")) {
            setTimeout(connect, 5000);
          }
        };

        socket.onerror = () => {};
      } catch (e) {}
    };

    connect();

    return () => {
      closed = true;
      try { socket?.close(); } catch (e) {}
    };
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationPanelVisible(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownVisible(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="h-20 backdrop-blur-sm bg-white/80 border-b border-gray-200 fixed top-0 left-0 right-0 z-[60]">
      <div className="h-full px-4 mx-auto flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="inline-flex items-center justify-center p-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
            <img src="/sanvii-icon.png" alt="Sanvii Logo" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <h1 className="logo-text">SANVII TECHMET</h1>
              <p className="tagline">Deploying Excellence, Delivering Success</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button onClick={toggleSearch} className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors text-sm hidden sm:flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages..."
                      className="bg-transparent border-none outline-none text-sm text-gray-800 w-full"
                      onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); if (e.key === "Enter" && filteredSearch.length > 0) handleSearchSelect(filteredSearch[0].path); }}
                    />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchQuery.trim() === "" ? (
                    <div className="p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
                      {[
                        { icon: Users, label: "Employees", path: "/employeelist" },
                        { icon: Calendar, label: "Apply Leave", path: "/leave-application" },
                        { icon: FileText, label: "Documents", path: "/documents" },
                        { icon: Settings, label: "Attendance", path: "/attendance-management" },
                      ].map((item) => (
                        <button key={item.path} onClick={() => handleSearchSelect(item.path)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition">
                          <item.icon className="h-4 w-4 text-gray-400" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : filteredSearch.length > 0 ? (
                    filteredSearch.map((item) => (
                      <button key={item.path} onClick={() => handleSearchSelect(item.path)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm text-gray-700 transition border-b border-gray-50 last:border-0">
                        <Search className="h-4 w-4 text-gray-400" />
                        {item.label}
                      </button>
                    ))
                  ) : (
                    <div className="p-5 text-center text-sm text-gray-400">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            {isDropdownVisible && (
              <div className="absolute right-0 z-20 bg-white shadow-xl rounded-xl mt-2 border border-gray-200 w-64 overflow-hidden">
                {/* Profile header */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium overflow-hidden">
                      {userProfile.profilePicture
                        ? <img src={userProfile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        : (userProfile.firstname || username).charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userProfile.firstname || username} {userProfile.lastname || ""}</p>
                      <p className="text-xs text-gray-500">{userProfile.designation || roles[0] || ""}</p>
                      {userProfile.employeeId && <p className="text-[11px] text-gray-400">{userProfile.employeeId}</p>}
                    </div>
                  </div>
                </div>
                {/* Menu items */}
                <div className="py-1">
                  <button onClick={() => { setDropdownVisible(false); if (userProfile.id) navigate(`/view-employee/${userProfile.id}`); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <User className="h-4 w-4 text-gray-400" />
                    My Profile
                  </button>
                  <button onClick={() => { setDropdownVisible(false); navigate("/leave-balance"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Leave Balance
                  </button>
                  <button onClick={() => { setDropdownVisible(false); navigate("/attendance-management"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <FileText className="h-4 w-4 text-gray-400" />
                    My Attendance
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={() => { setDropdownVisible(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button onClick={toggleNotificationPanel} className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-2 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            {isNotificationPanelVisible && (
              <div className="absolute right-0 z-20 w-80 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-900">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={() => { setNotifications([]); setUnreadCount(0); }} className="text-xs text-blue-600 hover:text-blue-800">Clear All</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bell className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No notifications yet</p>
                      <p className="text-xs text-gray-300 mt-1">You'll see updates here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <Button onClick={handleLogout} className="ml-2 hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-2 text-sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
