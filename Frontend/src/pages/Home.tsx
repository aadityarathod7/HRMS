import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Users, FileText, Clock, DollarSign, Calendar, UserCheck, UserX, Briefcase, TrendingUp, Gift, CalendarDays } from "lucide-react";

const Home: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const navigate = useNavigate();

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const res = await axios.get(, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) navigate("/login");
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const IconCard = ({ icon: Icon, label, value, sub, color, onClick }: any) => (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div className={`p-2.5 rounded-lg ${color}`}><Icon size={20} /></div>
      <div>
        <p className="text-2xl font-light text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

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
              {/* ====== ADMIN / HR ====== */}
              {role === "ADMIN" && (
                <>
                  {/* Stat cards - clean SaaS style */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                    {[
                      { label: "Total Employees", value: stats.activeEmployees || 0, sub: `${stats.totalEmployees || 0} registered`, trend: null, path: "/employeelist" },
                      { label: "New This Month", value: stats.newJoiners || 0, sub: "Joiners", trend: null, path: null },
                      { label: "On Leave Today", value: stats.onLeaveToday || 0, sub: "Employees absent", trend: null, path: null },
                      { label: "Pending Leaves", value: stats.pendingLeaves || 0, sub: "Awaiting approval", trend: "action", path: "/employee-leave-management" },
                      { label: "Pending Timesheets", value: stats.pendingTimesheets || 0, sub: "Need review", trend: "action", path: "/time-sheet-management" },
                    ].map((item, i) => (
                      <div key={i} onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl border border-gray-200 p-5 ${item.path ? "cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all" : ""}`}>
                        <p className="text-3xl font-light text-gray-900">{item.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                        {item.trend === "action" && item.value > 0 && (
                          <span className="inline-block mt-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Needs attention</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Main content row */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                    {/* Attendance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
                      <div className="flex justify-between items-center mb-5">
                        <p className="text-sm font-medium text-gray-700">Attendance Today</p>
                        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: "Present", val: stats.attendanceToday?.present || 0, color: "bg-gray-900" },
                          { label: "Work From Home", val: stats.attendanceToday?.wfh || 0, color: "bg-gray-400" },
                          { label: "Absent", val: stats.attendanceToday?.absent || 0, color: "bg-gray-200" },
                        ].map((item) => {
                          const total = Math.max((stats.attendanceToday?.present || 0) + (stats.attendanceToday?.wfh || 0) + (stats.attendanceToday?.absent || 0), 1);
                          return (
                            <div key={item.label} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{item.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className={`${item.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${(item.val / total) * 100}%` }} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-6 text-right">{item.val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Department Headcount */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-3">
                      <p className="text-sm font-medium text-gray-700 mb-5">Department Headcount</p>
                      <div className="space-y-3">
                        {(stats.departmentHeadcount || []).map((d: any, i: number) => {
                          const max = Math.max(...(stats.departmentHeadcount || []).map((x: any) => x.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-4">
                              <span className="text-sm text-gray-600 w-36 flex-shrink-0 truncate">{d.department}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-gray-800 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(d.count / max) * 100}%` }} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-6 text-right">{d.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Birthdays */}
                  {stats.upcomingBirthdays?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Upcoming Birthdays</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.upcomingBirthdays.map((b: any, i: number) => (
                          <div key={i} className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition">
                            <span className="text-lg">🎂</span>
                            <div>
                              <p className="text-sm text-gray-800">{b.name}</p>
                              <p className="text-[11px] text-gray-400">{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Team Size", value: stats.teamSize || 0, sub: "Direct reports", path: null },
                      { label: "Team On Leave", value: stats.teamOnLeave || 0, sub: "Today", path: null },
                      { label: "Pending Leaves", value: stats.pendingLeaves || 0, sub: "Need approval", path: "/employee-leave-management" },
                      { label: "Pending Timesheets", value: stats.pendingTimesheets || 0, sub: "Need review", path: "/time-sheet-management" },
                    ].map((item, i) => (
                      <div key={i} onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl border border-gray-200 p-5 ${item.path ? "cursor-pointer hover:border-blue-300 transition-all" : ""}`}>
                        <p className="text-3xl font-light text-gray-900">{item.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                        {item.path && item.value > 0 && <span className="inline-block mt-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Needs attention</span>}
                      </div>
                    ))}
                  </div>

                  {/* Team + Attendance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-medium text-gray-700 mb-4">My Team</p>
                      <div className="space-y-2">
                        {(stats.teamMembers || []).map((m: any) => (
                          <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">{m.name?.charAt(0)}</div>
                            <span className="text-sm text-gray-700">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-medium text-gray-700 mb-4">Team Attendance Today</p>
                      {stats.teamAttendanceToday?.length > 0 ? (
                        <div className="space-y-2">
                          {stats.teamAttendanceToday.map((a: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                              <span className="text-sm text-gray-700">{a.userId?.firstname} {a.userId?.lastname}</span>
                              <Badge status={a.status} />
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400">No records yet</p>}
                    </div>
                  </div>

                  {/* My data */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-medium text-gray-700 mb-4">My Leave Balance</p>
                      <div className="space-y-4">
                        {(stats.leaveBalance || []).map((lb: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-gray-600">{lb.leaveType}</span>
                              <span className="text-gray-900">{lb.available}<span className="text-gray-400">/{lb.totalAllotted}</span></span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-1.5 bg-gray-800 rounded-full" style={{ width: `${(lb.available / lb.totalAllotted) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-medium text-gray-700 mb-4">My Attendance This Month</p>
                      <div className="space-y-3">
                        {[
                          { label: "Present", val: stats.attendanceSummary?.present || 0 },
                          { label: "WFH", val: stats.attendanceSummary?.wfh || 0 },
                          { label: "Absent", val: stats.attendanceSummary?.absent || 0 },
                        ].map((item) => {
                          const total = Math.max((stats.attendanceSummary?.present || 0) + (stats.attendanceSummary?.wfh || 0) + (stats.attendanceSummary?.absent || 0), 1);
                          return (
                            <div key={item.label} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16">{item.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: `${(item.val / total) * 100}%` }} />
                              </div>
                              <span className="text-sm text-gray-700 w-5 text-right">{item.val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {stats.latestPayroll && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm font-medium text-gray-700 mb-2">Latest Payslip</p>
                        <p className="text-3xl font-light text-gray-900 mt-3">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                        <p className="text-xs text-gray-400 mt-1">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                        <div className="mt-3"><Badge status={stats.latestPayroll.status} /></div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ====== EMPLOYEE ====== */}
              {role === "EMPLOYEE" && (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Leave Available", value: (stats.leaveBalance || []).reduce((s: number, b: any) => s + b.available, 0), sub: "Days remaining", path: "/leave-balance" },
                      { label: "Present This Month", value: stats.attendanceSummary?.present || 0, sub: `${stats.attendanceSummary?.wfh || 0} WFH`, path: "/attendance-management" },
                      { label: "Last Salary", value: stats.latestPayroll ? formatCurrency(stats.latestPayroll.netSalary) : "—", sub: stats.latestPayroll ? `${stats.latestPayroll.month} ${stats.latestPayroll.year}` : "No record", path: "/payroll-management" },
                      { label: "Absent / On Leave", value: (stats.attendanceSummary?.absent || 0) + (stats.attendanceSummary?.onLeave || 0), sub: "This month", path: null },
                    ].map((item, i) => (
                      <div key={i} onClick={() => item.path && navigate(item.path)}
                        className={`bg-white rounded-xl border border-gray-200 p-5 ${item.path ? "cursor-pointer hover:border-blue-300 transition-all" : ""}`}>
                        <p className="text-3xl font-light text-gray-900">{item.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Leave Balance */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                    <div className="flex justify-between items-center mb-5">
                      <p className="text-sm font-medium text-gray-700">Leave Balance</p>
                      <button onClick={() => navigate("/leave-application")} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition">+ Apply Leave</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {(stats.leaveBalance || []).map((lb: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">{lb.leaveType}</span>
                            <span className="text-gray-900">{lb.available}<span className="text-gray-400">/{lb.totalAllotted}</span></span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-gray-800 rounded-full transition-all" style={{ width: `${(lb.available / lb.totalAllotted) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">{lb.used} days used</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance + Payslip */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <p className="text-sm font-medium text-gray-700 mb-5">Attendance This Month</p>
                      <div className="space-y-3">
                        {[
                          { label: "Present", val: stats.attendanceSummary?.present || 0 },
                          { label: "Work From Home", val: stats.attendanceSummary?.wfh || 0 },
                          { label: "Absent", val: stats.attendanceSummary?.absent || 0 },
                          { label: "Half Day", val: stats.attendanceSummary?.halfDay || 0 },
                          { label: "On Leave", val: stats.attendanceSummary?.onLeave || 0 },
                        ].map((item) => {
                          const total = Math.max(Object.values(stats.attendanceSummary || {}).reduce((s: number, v: any) => s + (v || 0), 0) as number, 1);
                          return (
                            <div key={item.label} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{item.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: `${(item.val / total) * 100}%` }} />
                              </div>
                              <span className="text-sm text-gray-700 w-6 text-right">{item.val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {stats.latestPayroll && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
                          <p className="text-sm font-medium text-gray-700">Latest Payslip</p>
                          <p className="text-3xl font-light text-gray-900 mt-3">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                          <p className="text-xs text-gray-400 mt-1">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                          <div className="mt-3"><Badge status={stats.latestPayroll.status} /></div>
                        </div>
                      )}

                      {stats.recentLeaves?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-medium text-gray-700">Recent Leaves</p>
                            <button onClick={() => navigate("/leave-balance")} className="text-xs text-gray-400 hover:text-blue-600">View all</button>
                          </div>
                          <div className="space-y-2">
                            {stats.recentLeaves.slice(0, 3).map((l: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                                <div>
                                  <p className="text-sm text-gray-700">{l.leaveType} · {l.numberOfDays || 1}d</p>
                                  <p className="text-[11px] text-gray-400">{new Date(l.leaveStartDate).toLocaleDateString('en-GB')}</p>
                                </div>
                                <Badge status={l.leaveStatus} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {/* Upcoming Events — All roles */}
              {stats.upcomingEvents?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2"><Calendar size={14} /> Upcoming Events</h3>
                    <button onClick={() => navigate("/events")} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View All →</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.upcomingEvents.slice(0, 6).map((e: any, i: number) => {
                      const typeConfig: Record<string, { bg: string; text: string; dot: string }> = {
                        BIRTHDAY: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
                        HOLIDAY: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
                        COMPANY_EVENT: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
                        TEAM_EVENT: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
                        TRAINING: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
                        WORK_ANNIVERSARY: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
                      };
                      const c = typeConfig[e.eventType] || { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                      return (
                        <div key={i} className={`${c.bg} rounded-xl p-3 flex items-start gap-3`}>
                          <div className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${c.text} truncate`}>{e.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <span className={`inline-block mt-1 text-[10px] ${c.text} opacity-70`}>{e.eventType?.replace(/_/g, ' ')}</span>
                          </div>
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
