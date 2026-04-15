import React, { useState } from "react";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LeaveBalance: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const leaveData = [
    { type: "Paid Leave", available: 12 },
    { type: "Casual Leave", available: 12 },
    { type: "Sick Leave", available: 12 },
    { type: "Maternity Leave", available: 180 },
    { type: "Paternity Leave", available: 15 },
  ];

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ];

  const chartData = {
    labels: leaveData.map((leave) => leave.type),
    datasets: [
      {
        label: "Available Leaves",
        data: leaveData.map((leave) => leave.available),
        backgroundColor: colors,
      },
    ],
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
          <h2 className="text-xl  text-blue-600 font-bold mb-4 mt-20"></h2>
          <div className="flex flex-row justify-between p-5 flex-grow">
            <div className="w-1/2 pr-2">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      className="border px-4 py-2 text-left"
                      style={{ pointerEvents: "none" }}
                    >
                      Leave Type
                    </th>
                    <th
                      className="border px-4 py-2 text-left"
                      style={{ pointerEvents: "none" }}
                    >
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaveData.map((leave, index) => (
                    <tr
                      key={leave.type}
                      className={
                        index % 2 === 0
                          ? "bg-gray-100 hover:bg-gray-200"
                          : "hover:bg-gray-200"
                      }
                    >
                      <td className="border px-4 py-2">{leave.type}</td>
                      <td className="border px-4 py-2">{leave.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="w-1/2 pl-2"
              style={{ width: "300px", height: "300px" }}
            >
              <Pie data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default LeaveBalance;
