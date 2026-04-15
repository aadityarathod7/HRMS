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
    // Clear all auth-related data from localStorage
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <>
      <nav className="h-16 border-b bg-gradient-to-r from-violet-500/80 to-purple-500/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:bg-white/20"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <div className="ml-4 hidden sm:block">
              <div className="flex flex-col">
                <h1 className="logo-text">SANVII TECHMET</h1>
                <p className="tagline text-[#2F3C8D]">
                  Deploying Excellence, Delivering Success
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleDropdown}
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              {isDropdownVisible && (
                <div className="absolute z-10 bg-white shadow-lg rounded mt-2 left-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-gray-200"
                  >
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-gray-200"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 relative"
              onClick={toggleNotificationPanel}
            >
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </Button>
            {isNotificationPanelVisible && (
              <div
                ref={notificationRef}
                className="notification-panel absolute z-10 left-0 w-64"
              >
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-semibold text-violet-800">
                    Notifications
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-gray-500 hover:bg-gray-200"
                  >
                    Clear All
                  </Button>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="notification-item p-2 border-b">
                      <div className="font-semibold">
                        {notification.message}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {notification.timestamp}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2">No notifications</div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
