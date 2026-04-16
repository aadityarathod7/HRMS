import { Button } from "@/components/ui/button";
import { MenuIcon, Search, User, Bell, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { toast } from "react-toastify";

interface Notification {
  message: string;
  timestamp: string;
}

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isNotificationPanelVisible, setNotificationPanelVisible] =
    useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const toggleNotificationPanel = () => {
    setNotificationPanelVisible(!isNotificationPanelVisible);
    if (isNotificationPanelVisible) {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Logout failed: No authentication token found");
      return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("google_credential");
    localStorage.removeItem("username");
    localStorage.removeItem("creatorName");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000/leaveNotification");

    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error observed:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    socket.onmessage = (event) => {
      const notification: Notification = {
        message: event.data,
        timestamp: new Date().toLocaleTimeString(),
      };
      console.log("Received notification:", notification);
      setNotifications((prev) => [...prev, notification]);
      setUnreadCount((prev) => prev + 1);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationPanelVisible(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <>
      <nav className="h-20 backdrop-blur-sm bg-white/80 border-b border-gray-200 fixed top-0 left-0 right-0 z-[60]">
        <div className="h-full px-4 mx-auto flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src="/sanvii-icon.png"
                alt="Sanvii Logo"
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="logo-text">SANVII TECHMET</h1>
                <p className="tagline">
                  Deploying Excellence, Delivering Success
                </p>
              </div>
            </div>
          </div>

          {/* Right: Nav actions */}
          <div className="flex items-center gap-1">
            <button className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors font-light text-sm hidden sm:flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors font-light text-sm flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              {isDropdownVisible && (
                <div className="absolute right-0 z-10 bg-white shadow-lg rounded-md mt-2 border border-gray-100 min-w-[140px] py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotificationPanel}
                className="px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors font-light text-sm flex items-center gap-2 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationPanelVisible && (
                <div className="absolute right-0 z-10 w-72 mt-2 bg-white shadow-lg rounded-md border border-gray-100 max-h-[300px] overflow-y-auto">
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-900 text-sm">
                      Notifications
                    </span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm text-gray-800">
                          {notification.message}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {notification.timestamp}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button - matching website style */}
            <Button
              onClick={handleLogout}
              className="ml-2 hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-2 text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
