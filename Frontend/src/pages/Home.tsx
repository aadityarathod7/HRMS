import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Users, FileText, Clock, DollarSign, Calendar, UserCheck, UserX, Briefcase, TrendingUp, Gift } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Indian national public holidays with names (YYYY-MM-DD)
const PUBLIC_HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-01-26": "Republic Day",
  "2025-03-14": "Holi",
  "2025-04-14": "Dr. Ambedkar Jayanti",
  "2025-04-18": "Good Friday",
  "2025-08-15": "Independence Day",
  "2025-10-02": "Gandhi Jayanti",
  "2025-10-20": "Diwali",
  "2025-12-25": "Christmas",
  // 2026
  "2026-01-26": "Republic Day",
  "2026-03-03": "Holi",
  "2026-04-03": "Good Friday",
  "2026-04-14": "Dr. Ambedkar Jayanti",
  "2026-08-15": "Independence Day",
  "2026-10-02": "Gandhi Jayanti",
  "2026-11-09": "Diwali",
  "2026-12-25": "Christmas",
};

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const ATT_COLORS: Record<string, { bg: string; color: string }> = {
  PRESENT:  { bg: "#d1fae5", color: "#065f46" },
  WFH:      { bg: "#dbeafe", color: "#1e40af" },
  ABSENT:   { bg: "#fee2e2", color: "#b91c1c" },
  HALF_DAY: { bg: "#fef3c7", color: "#92400e" },
  ON_LEAVE: { bg: "#ede9fe", color: "#5b21b6" },
  HOLIDAY:  { bg: "#fce7f3", color: "#9d174d" },
  WEEKEND:  { bg: "#f3f4f6", color: "#9ca3af" },
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Present", WFH: "Work From Home", ABSENT: "Absent",
  HALF_DAY: "Half Day", ON_LEAVE: "On Leave", HOLIDAY: "Holiday", WEEKEND: "Weekend",
};

const MiniCalendar: React.FC<{ records: any[] }> = ({ records }) => {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [tooltip, setTooltip] = React.useState<{ day: number; label: string } | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("en", { month: "long" });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build map: day → { status, label }
  const dayMap: Record<number, { status: string; label: string }> = {};

  // First add attendance/leave records
  records.forEach((r: any) => {
    const dateStr = r.date?.split("T")[0];
    if (!dateStr) return;
    const [y, m, d] = dateStr.split("-").map(Number);
    if (m - 1 === viewMonth && y === viewYear) {
      dayMap[d] = { status: r.status, label: r.label || STATUS_LABEL[r.status] || r.status };
    }
  });

  // Overlay public holidays (don't overwrite existing attendance)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const holidayName = PUBLIC_HOLIDAYS[dateStr];
    if (holidayName && !dayMap[d]) {
      dayMap[d] = { status: "HOLIDAY", label: holidayName };
    }
  }

  const LEGEND = [
    { label: "Present", ...ATT_COLORS.PRESENT },
    { label: "WFH",     ...ATT_COLORS.WFH },
    { label: "Absent",  ...ATT_COLORS.ABSENT },
    { label: "Half Day",...ATT_COLORS.HALF_DAY },
    { label: "On Leave",...ATT_COLORS.ON_LEAVE },
    { label: "Holiday", ...ATT_COLORS.HOLIDAY },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition text-base font-medium"
        >‹</button>
        <p className="text-sm font-semibold text-gray-700 tracking-wide">
          {monthName} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition text-base font-medium"
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 500, color: "#9ca3af", paddingBottom: 6 }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const entry = dayMap[day];
          const dateObj = new Date(viewYear, viewMonth, day);
          const weekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const c = entry ? ATT_COLORS[entry.status] : weekend ? ATT_COLORS.WEEKEND : null;
          const tooltipText = entry ? entry.label : weekend ? "Weekend" : null;

          return (
            <div key={day}
              style={{ position: "relative", display: "flex", justifyContent: "center" }}
              onMouseEnter={() => tooltipText ? setTooltip({ day, label: tooltipText }) : null}
              onMouseLeave={() => setTooltip(null)}>
              <div style={{
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 8, fontSize: 12, transition: "all 0.15s",
                backgroundColor: c?.bg || "transparent",
                color: c?.color || (isToday ? "#111827" : "#6b7280"),
                fontWeight: isToday ? 700 : 400,
                boxShadow: isToday ? "inset 0 0 0 1.5px #9ca3af" : "none",
              }}>
                {day}
              </div>
              {tooltip?.day === day && tooltipText && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                  zIndex: 20, pointerEvents: "none",
                }}>
                  <div style={{
                    backgroundColor: "#1f2937", color: "#fff", fontSize: 10, padding: "4px 8px",
                    borderRadius: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}>
                    {tooltip.label}
                    <div style={{
                      position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                      borderWidth: 4, borderStyle: "solid",
                      borderColor: "#1f2937 transparent transparent transparent",
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", marginTop: 16, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, backgroundColor: l.bg, border: `1px solid ${l.color}33` }} />
            <span style={{ fontSize: 10, color: "#6b7280" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmployeeDashboard: React.FC<{ stats: any; attendanceRecords: any[]; navigate: any; formatCurrency: any; Badge: any }> = ({ stats, attendanceRecords, navigate, formatCurrency, Badge }) => {
  const totalLeave = (stats.leaveBalance || []).reduce((s: number, b: any) => s + b.available, 0);
  const present = stats.attendanceSummary?.present || 0;
  const wfh = stats.attendanceSummary?.wfh || 0;
  const absentOnLeave = (stats.attendanceSummary?.absent || 0) + (stats.attendanceSummary?.onLeave || 0);

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Leave Available */}
        <div onClick={() => navigate("/leave-balance")} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Leave Available</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition">
              <Calendar size={15} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-light text-gray-900">{totalLeave}</p>
          <p className="text-xs text-gray-400 mt-0.5">days remaining</p>
        </div>

        {/* Present This Month */}
        <div onClick={() => navigate("/attendance-management")} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-emerald-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Present</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition">
              <UserCheck size={15} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-light text-gray-900">{present}</p>
          <p className="text-xs text-gray-400 mt-0.5">{wfh} WFH this month</p>
        </div>

        {/* Last Salary */}
        <div onClick={() => navigate("/payroll-management")} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-violet-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Last Salary</span>
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition">
              <DollarSign size={15} className="text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-light text-gray-900 truncate">
            {stats.latestPayroll ? formatCurrency(stats.latestPayroll.netSalary) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.latestPayroll ? `${stats.latestPayroll.month} ${stats.latestPayroll.year}` : "No payroll yet"}
          </p>
        </div>

        {/* Absent / On Leave */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Absent / Leave</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-light text-gray-900">{absentOnLeave}</p>
          <p className="text-xs text-gray-400 mt-0.5">days this month</p>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-700">Leave Balance</p>
          <button onClick={() => navigate("/leave-application")} className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition">+ Apply Leave</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(stats.leaveBalance || []).map((lb: any, i: number) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600">{lb.leaveType}</span>
                <span className="text-xs text-gray-900 font-medium">{lb.available}<span className="text-gray-400 font-normal">/{lb.totalAllotted}</span></span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((lb.available / lb.totalAllotted) * 100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">{lb.used} used · {lb.available} left</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar + Recent Leaves side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MiniCalendar records={attendanceRecords} />

        <div className="flex flex-col gap-4">
          {/* Latest Payslip */}
          {stats.latestPayroll && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Latest Payslip</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-light text-gray-900">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                </div>
                <Badge status={stats.latestPayroll.status} />
              </div>
            </div>
          )}

          {/* Recent Leaves */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Recent Leaves</p>
              <button onClick={() => navigate("/leave-balance")} className="text-xs text-blue-600 hover:text-blue-800">View all</button>
            </div>
            {(stats.recentLeaves || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No leaves applied</p>
            ) : (
              <div className="space-y-0 divide-y divide-gray-100">
                {(stats.recentLeaves || []).slice(0, 5).map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-gray-800">{l.leaveType} <span className="text-gray-400 text-xs">· {l.numberOfDays || 1}d</span></p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(l.leaveStartDate).toLocaleDateString('en-GB')} — {new Date(l.leaveEndDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <Badge status={l.leaveStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Home: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const navigate = useNavigate();

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const res = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);

        // Fetch attendance for current month (employee only)
        const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
        const myProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        if (!roles.some(r => ["ADMIN", "HR", "MANAGER"].includes(r)) && myProfile.id) {
          const [attRes, leaveRes] = await Promise.all([
            axios.get(`${API_URL}/attendance/user/${myProfile.id}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/leaverequests/user/${myProfile.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const attRecords: any[] = attRes.data || [];

          // Expand approved leaves into individual day records for the calendar
          const leaveRecords: any[] = [];
          (leaveRes.data || []).forEach((leave: any) => {
            if (leave.leaveStatus !== "APPROVED") return;
            const start = new Date(leave.leaveStartDate);
            const end = new Date(leave.leaveEndDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split("T")[0];
              // Only add if not already present in attendance records
              if (!attRecords.some((a: any) => a.date?.startsWith(dateStr))) {
                leaveRecords.push({ date: dateStr, status: "ON_LEAVE", label: `On Leave — ${leave.leaveType}` });
              }
            }
          });

          // Auto-fill weekdays as PRESENT from dateOfJoining to today
          const autoPresent: any[] = [];
          const doj = myProfile.dateOfJoining ? new Date(myProfile.dateOfJoining) : null;
          if (doj) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const allRecordDates = new Set([
              ...attRecords.map((a: any) => a.date?.split("T")[0]),
              ...leaveRecords.map((l: any) => l.date),
            ]);
            for (let d = new Date(doj); d <= today; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split("T")[0];
              if (!isWeekend(d) && !(dateStr in PUBLIC_HOLIDAYS) && !allRecordDates.has(dateStr)) {
                autoPresent.push({ date: dateStr, status: "PRESENT" });
              }
            }
          }

          setAttendanceRecords([...attRecords, ...leaveRecords, ...autoPresent]);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) navigate("/login");
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);


  const Badge = ({ status }: { status: string }) => {
    const s: Record<string, string> = {
      APPROVED: "bg-blue-100 text-blue-700", PRESENT: "bg-blue-100 text-blue-700", PAID: "bg-blue-100 text-blue-700",
      PENDING: "bg-amber-50 text-amber-700", WFH: "bg-indigo-50 text-indigo-600",
      REJECTED: "bg-gray-100 text-gray-600", ABSENT: "bg-gray-100 text-gray-600", CANCELLED: "bg-gray-100 text-gray-500",
    };
    return <span className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${s[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
  };

  const role = stats?.role;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-900">{greeting}, {userProfile.firstname || username}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {userProfile.designation || ""}{userProfile.department?.departmentName ? ` · ${userProfile.department.departmentName}` : ""}
              {userProfile.employeeId ? ` · ${userProfile.employeeId}` : ""}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24 animate-pulse" />)}
            </div>
          ) : !stats ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
              <p className="text-gray-500">Unable to load dashboard.</p>
              <button onClick={() => navigate("/login")} className="mt-3 text-blue-600 hover:text-blue-800 text-sm">Go to Login</button>
            </div>
          ) : (
            <>
              {/* ====== ADMIN ====== */}
              {role === "ADMIN" && (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                    {[
                      { icon: Users, label: "Active Employees", value: stats.activeEmployees || 0, sub: `${stats.totalEmployees || 0} total`, path: "/employeelist", iconBg: "#eff6ff", iconColor: "#2563eb", hoverBorder: "#bfdbfe" },
                      { icon: UserCheck, label: "New Joiners", value: stats.newJoiners || 0, sub: "This month", path: null, iconBg: "#f0fdf4", iconColor: "#16a34a", hoverBorder: "#bbf7d0" },
                      { icon: Calendar, label: "On Leave Today", value: stats.onLeaveToday || 0, sub: "Employees", path: null, iconBg: "#fffbeb", iconColor: "#d97706", hoverBorder: "#fde68a" },
                      { icon: FileText, label: "Pending Leaves", value: stats.pendingLeaves || 0, sub: "Awaiting approval", path: "/leave-management", iconBg: "#fff7ed", iconColor: "#ea580c", hoverBorder: "#fed7aa" },
                      { icon: Clock, label: "Pending Timesheets", value: stats.pendingTimesheets || 0, sub: "Need review", path: "/time-sheet-management", iconBg: "#faf5ff", iconColor: "#9333ea", hoverBorder: "#e9d5ff" },
                    ].map((item, i) => (
                      <div key={i} onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl border border-gray-200 p-4 ${item.path ? "cursor-pointer hover:shadow-sm transition" : ""}`}
                        style={{ borderColor: "#e5e7eb" }}
                        onMouseEnter={e => item.path && ((e.currentTarget as HTMLDivElement).style.borderColor = item.hoverBorder)}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb")}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 uppercase tracking-wider leading-tight">{item.label}</span>
                          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <item.icon size={15} style={{ color: item.iconColor }} />
                          </div>
                        </div>
                        <p className="text-2xl font-light text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Attendance + Dept Headcount */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Attendance Today</p>
                      <div className="flex justify-around">
                        {[
                          { label: "Present", val: stats.attendanceToday?.present || 0, bg: "#eff6ff", color: "#2563eb", Icon: UserCheck },
                          { label: "WFH", val: stats.attendanceToday?.wfh || 0, bg: "#eef2ff", color: "#4f46e5", Icon: Briefcase },
                          { label: "Absent", val: stats.attendanceToday?.absent || 0, bg: "#f9fafb", color: "#6b7280", Icon: UserX },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                              <item.Icon size={18} style={{ color: item.color }} />
                            </div>
                            <p className="text-xl font-light text-gray-900">{item.val}</p>
                            <p className="text-[11px] text-gray-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Department Headcount</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(stats.departmentHeadcount || []).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700">{d.department}</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Birthdays */}
                  {stats.upcomingBirthdays?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Gift size={13} /> Upcoming Birthdays</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.upcomingBirthdays.map((b: any, i: number) => (
                          <span key={i} className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-sm border border-amber-100">
                            🎂 {b.name} · {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ====== MANAGER ====== */}
              {role === "MANAGER" && (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {[
                      { icon: Users, label: "My Team", value: stats.teamSize || 0, sub: "Direct reports", path: null, iconBg: "#eff6ff", iconColor: "#2563eb", hoverBorder: "#bfdbfe" },
                      { icon: Calendar, label: "Team On Leave", value: stats.teamOnLeave || 0, sub: "Today", path: null, iconBg: "#fffbeb", iconColor: "#d97706", hoverBorder: "#fde68a" },
                      { icon: FileText, label: "Pending Leaves", value: stats.pendingLeaves || 0, sub: "Need approval", path: "/employee-leave-management", iconBg: "#fff7ed", iconColor: "#ea580c", hoverBorder: "#fed7aa" },
                      { icon: Clock, label: "Pending Timesheets", value: stats.pendingTimesheets || 0, sub: "Need review", path: "/time-sheet-management", iconBg: "#faf5ff", iconColor: "#9333ea", hoverBorder: "#e9d5ff" },
                    ].map((item, i) => (
                      <div key={i} onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl border border-gray-200 p-4 ${item.path ? "cursor-pointer hover:shadow-sm transition" : ""}`}
                        style={{ borderColor: "#e5e7eb" }}
                        onMouseEnter={e => item.path && ((e.currentTarget as HTMLDivElement).style.borderColor = item.hoverBorder)}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb")}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
                          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <item.icon size={15} style={{ color: item.iconColor }} />
                          </div>
                        </div>
                        <p className="text-2xl font-light text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Team members + Team attendance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">My Team</p>
                      <div className="flex flex-wrap gap-2">
                        {(stats.teamMembers || []).map((m: any) => (
                          <span key={m.id} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-sm">{m.name}</span>
                        ))}
                        {!(stats.teamMembers?.length) && <p className="text-sm text-gray-400">No team members</p>}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Team Attendance Today</p>
                      {stats.teamAttendanceToday?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {stats.teamAttendanceToday.map((a: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-700">{a.userId?.firstname} {a.userId?.lastname}</span>
                              <Badge status={a.status} />
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400">No records yet</p>}
                    </div>
                  </div>

                  {/* My overview */}
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">My Overview</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Leave Balance</p>
                      <div className="space-y-3">
                        {(stats.leaveBalance || []).map((lb: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-gray-600">{lb.leaveType}</span>
                              <span className="text-gray-900 font-medium">{lb.available}<span className="text-gray-400 font-normal">/{lb.totalAllotted}</span></span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${Math.min((lb.available / lb.totalAllotted) * 100, 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Attendance This Month</p>
                      <div className="flex gap-3">
                        {[
                          { label: "Present", val: stats.attendanceSummary?.present || 0, bg: "#eff6ff", color: "#2563eb" },
                          { label: "WFH", val: stats.attendanceSummary?.wfh || 0, bg: "#eef2ff", color: "#4f46e5" },
                          { label: "Absent", val: stats.attendanceSummary?.absent || 0, bg: "#f9fafb", color: "#6b7280" },
                        ].map(item => (
                          <div key={item.label} className="flex-1 rounded-lg py-3 text-center" style={{ backgroundColor: item.bg }}>
                            <p className="text-lg font-light" style={{ color: item.color }}>{item.val}</p>
                            <p className="text-[11px]" style={{ color: item.color }}>{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {stats.latestPayroll && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Latest Payslip</p>
                        <p className="text-2xl font-light text-gray-900">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                        <p className="text-xs text-gray-400 mt-1">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                        <div className="mt-2"><Badge status={stats.latestPayroll.status} /></div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ====== EMPLOYEE ====== */}
              {role === "EMPLOYEE" && <EmployeeDashboard stats={stats} attendanceRecords={attendanceRecords} navigate={navigate} formatCurrency={formatCurrency} Badge={Badge} />}
              {/* Upcoming Events — All roles */}
              {stats.upcomingEvents?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2"><Calendar size={14} /> Upcoming Events</h3>
                    <button onClick={() => navigate("/events")} className="text-xs text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="space-y-2">
                    {stats.upcomingEvents.slice(0, 5).map((e: any, i: number) => {
                      const typeColors: Record<string, string> = {
                        BIRTHDAY: "bg-amber-50 text-amber-700",
                        HOLIDAY: "bg-red-50 text-red-600",
                        COMPANY_EVENT: "bg-blue-50 text-blue-700",
                        TEAM_EVENT: "bg-purple-50 text-purple-700",
                        TRAINING: "bg-green-50 text-green-700",
                        WORK_ANNIVERSARY: "bg-teal-50 text-teal-700",
                      };
                      const color = typeColors[e.eventType] || "bg-gray-50 text-gray-600";
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${color}`}>{e.eventType?.replace("_", " ")}</span>
                            <span className="text-sm text-gray-800">{e.title}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-GB')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
