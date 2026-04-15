import React, { useState } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      <div
        className={`flex flex-col flex-grow w-full max-w-6xl transition-all duration-300 ${
          isCollapsed ? "ml-40" : "ml-80"
        }`}
      >
        <div className="p-5 flex-grow">
        
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
