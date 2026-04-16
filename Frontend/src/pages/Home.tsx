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
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      <div
        className={`flex flex-col flex-grow w-full transition-all duration-300 ${
          isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"
        }`}
      >
        <div className="pt-28 px-5 pb-5 flex-grow">
        
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
