import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";

interface AttendanceEntry {
  id: string;
  userId: { id: string; firstname: string; lastname: string; userName: string };
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

const AttendanceManagement: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [records, setRecords] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedStatus === "ALL"
        ? "http://localhost:5000/attendance/all"
        : `http://localhost:5000/attendance/status/${selectedStatus}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [selectedStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/attendance/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Record deleted");
      fetchRecords();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PRESENT: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
      HALF_DAY: "bg-yellow-100 text-yellow-800",
      ON_LEAVE: "bg-blue-100 text-blue-800",
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100"}`}>{status.replace("_", " ")}</span>;
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full max-w-6xl transition-all duration-300 ${isCollapsed ? "ml-40" : "ml-80"}`}>
        <div className="p-5 flex-grow">
          <div className="flex justify-end gap-4 mt-24 mb-5">
            <select
              className="bg-blue-600 text-white px-6 py-3 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 font-medium text-gray-700 text-left">Employee</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Date</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Check In</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Check Out</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Status</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Notes</th>
                  <th className="p-3 font-medium text-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="p-5 text-center text-gray-500">Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} className="p-5 text-center text-gray-500">No attendance records found</td></tr>
                ) : records.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">{entry.userId?.firstname} {entry.userId?.lastname}</td>
                    <td className="p-3 text-gray-600">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="p-3 text-gray-600">{entry.checkIn || "-"}</td>
                    <td className="p-3 text-gray-600">{entry.checkOut || "-"}</td>
                    <td className="p-3">{getStatusBadge(entry.status)}</td>
                    <td className="p-3 text-gray-600">{entry.notes || "-"}</td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AttendanceManagement;
