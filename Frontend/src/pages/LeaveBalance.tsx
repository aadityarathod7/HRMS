import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface LeaveBalanceData {
  id: string;
  leaveType: string;
  totalAllotted: number;
  used: number;
  available: number;
  year: number;
}

const COLORS = [
  "rgba(37, 99, 235, 0.7)",
  "rgba(59, 130, 246, 0.7)",
  "rgba(96, 165, 250, 0.7)",
  "rgba(147, 197, 253, 0.7)",
  "rgba(191, 219, 254, 0.7)",
  "rgba(30, 64, 175, 0.7)",
  "rgba(29, 78, 216, 0.7)",
];

const LeaveBalance: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [balances, setBalances] = useState<LeaveBalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = userProfile.id;
        if (!userId) { setLoading(false); return; }
        const res = await axios.get(
          `http://localhost:5000/leaverequests/balance/${userId}?year=${new Date().getFullYear()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBalances(res.data);
      } catch (err) {
        // silent
      } finally { setLoading(false); }
    };
    fetchBalance();
  }, []);

  const chartData = {
    labels: balances.map(b => b.leaveType),
    datasets: [
      {
        label: "Available",
        data: balances.map(b => b.available),
        backgroundColor: COLORS.slice(0, balances.length),
        borderWidth: 0,
      },
    ],
  };

  const totalAllotted = balances.reduce((sum, b) => sum + b.totalAllotted, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalAvailable = balances.reduce((sum, b) => sum + b.available, 0);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          <h2 className="text-2xl font-light text-gray-900 mb-6">
            Leave Balance — {userProfile.firstname} {userProfile.lastname}
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : balances.length === 0 ? (
            <p className="text-gray-500">No leave balance data found for {new Date().getFullYear()}.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Allotted</p>
                  <p className="text-2xl font-light text-gray-900 mt-1">{totalAllotted}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Used</p>
                  <p className="text-2xl font-light text-gray-900 mt-1">{totalUsed}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Available</p>
                  <p className="text-2xl font-light text-blue-600 mt-1">{totalAvailable}</p>
                </div>
              </div>

              {/* Table + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Leave Type</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Allotted</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Used</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {balances.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{b.leaveType}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{b.totalAllotted}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{b.used}</td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{b.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
                  <div style={{ width: "280px", height: "280px" }}>
                    <Pie
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "bottom", labels: { padding: 16, font: { size: 12 } } },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LeaveBalance;
