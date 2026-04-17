import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Users, FileText, Clock, DollarSign, Calendar, UserCheck, UserX, Briefcase, TrendingUp, Gift, CalendarDays } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        const res = await axios.get(`${API_URL}/dashboard/stats`, {
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
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <IconCard icon={Users} label="Active Employees" value={stats.activeEmployees || 0} sub={`${stats.totalEmployees || 0} total`} color="bg-blue-50 text-blue-600" onClick={() => navigate("/employeelist")} />
                    <IconCard icon={UserCheck} label="New Joiners" value={stats.newJoiners || 0} sub="This month" color="bg-green-50 text-green-600" />
                    <IconCard icon={Calendar} label="On Leave Today" value={stats.onLeaveToday || 0} color="bg-amber-50 text-amber-600" />
                    <IconCard icon={FileText} label="Pending Leaves" value={stats.pendingLeaves || 0} sub="Awaiting approval" color="bg-orange-50 text-orange-600" onClick={() => navigate("/leave-management")} />
                    <IconCard icon={Clock} label="Pending Timesheets" value={stats.pendingTimesheets || 0} color="bg-purple-50 text-purple-600" onClick={() => navigate("/time-sheet-management")} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Attendance */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Attendance Today</h3>
                      <div className="flex justify-around">
                        {[
                          { label: "Present", val: stats.attendanceToday?.present || 0, icon: UserCheck, color: "text-blue-600 bg-blue-50" },
                          { label: "WFH", val: stats.attendanceToday?.wfh || 0, icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
                          { label: "Absent", val: stats.attendanceToday?.absent || 0, icon: UserX, color: "text-gray-500 bg-gray-50" },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-2`}><item.icon size={18} /></div>
                            <p className="text-xl font-light text-gray-900">{item.val}</p>
                            <p className="text-[11px] text-gray-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Department Headcount */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm col-span-1 lg:col-span-2">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Department Headcount</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(stats.departmentHeadcount || []).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700">{d.department}</span>
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {stats.upcomingBirthdays?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Gift size={14} /> Upcoming Birthdays</h3>
                      <div className="flex flex-wrap gap-2">
                        {stats.upcomingBirthdays.map((b: any, i: number) => (
                          <span key={i} className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-sm">
                            {b.name} · {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <IconCard icon={Users} label="My Team" value={stats.teamSize || 0} sub="Direct reports" color="bg-blue-50 text-blue-600" />
                    <IconCard icon={Calendar} label="Team On Leave" value={stats.teamOnLeave || 0} sub="Today" color="bg-amber-50 text-amber-600" />
                    <IconCard icon={FileText} label="Pending Leaves" value={stats.pendingLeaves || 0} sub="Need approval" color="bg-orange-50 text-orange-600" onClick={() => navigate("/employee-leave-management")} />
                    <IconCard icon={Clock} label="Pending Timesheets" value={stats.pendingTimesheets || 0} color="bg-purple-50 text-purple-600" onClick={() => navigate("/time-sheet-management")} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Team */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">My Team</h3>
                      <div className="flex flex-wrap gap-2">
                        {(stats.teamMembers || []).map((m: any) => (
                          <span key={m.id} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">{m.name}</span>
                        ))}
                      </div>
                    </div>

                    {/* Team Attendance */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Team Attendance Today</h3>
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

                  {/* My Overview */}
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">My Overview</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Leave Balance</h3>
                      <div className="space-y-3">
                        {(stats.leaveBalance || []).map((lb: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{lb.leaveType}</span>
                              <span className="text-gray-900 font-medium">{lb.available}/{lb.totalAllotted}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(lb.available / lb.totalAllotted) * 100}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Attendance This Month</h3>
                      <div className="flex gap-4">
                        {[
                          { label: "Present", val: stats.attendanceSummary?.present || 0, color: "bg-blue-50 text-blue-600" },
                          { label: "WFH", val: stats.attendanceSummary?.wfh || 0, color: "bg-indigo-50 text-indigo-600" },
                          { label: "Absent", val: stats.attendanceSummary?.absent || 0, color: "bg-gray-50 text-gray-500" },
                        ].map((item) => (
                          <div key={item.label} className={`${item.color} rounded-lg px-3 py-2 text-center flex-1`}>
                            <p className="text-lg font-light">{item.val}</p>
                            <p className="text-[11px]">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {stats.latestPayroll && (
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Latest Payslip</h3>
                        <p className="text-2xl font-light text-gray-900">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                        <p className="text-xs text-gray-400 mt-1">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                        <div className="mt-2"><Badge status={stats.latestPayroll.status} /></div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ====== EMPLOYEE ====== */}
              {role === "EMPLOYEE" && (
                <>
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <IconCard icon={Calendar} label="Leave Available" value={(stats.leaveBalance || []).reduce((s: number, b: any) => s + b.available, 0)} sub="All types" color="bg-blue-50 text-blue-600" onClick={() => navigate("/leave-balance")} />
                    <IconCard icon={UserCheck} label="Present This Month" value={stats.attendanceSummary?.present || 0} sub={`${stats.attendanceSummary?.wfh || 0} WFH`} color="bg-green-50 text-green-600" onClick={() => navigate("/attendance-management")} />
                    <IconCard icon={DollarSign} label="Last Salary" value={stats.latestPayroll ? formatCurrency(stats.latestPayroll.netSalary) : "—"} sub={stats.latestPayroll ? `${stats.latestPayroll.month} ${stats.latestPayroll.year}` : ""} color="bg-emerald-50 text-emerald-600" />
                    <IconCard icon={TrendingUp} label="Absent/Leave" value={(stats.attendanceSummary?.absent || 0) + (stats.attendanceSummary?.onLeave || 0)} sub="This month" color="bg-amber-50 text-amber-600" />
                  </div>

                  {/* Leave Balance with progress bars */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider">Leave Balance</h3>
                      <button onClick={() => navigate("/leave-application")} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Apply Leave</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(stats.leaveBalance || []).map((lb: any, i: number) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-700">{lb.leaveType}</span>
                            <span className="text-sm font-medium text-gray-900">{lb.available} left</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${(lb.available / lb.totalAllotted) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1.5">{lb.used} used of {lb.totalAllotted}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 mb-6">
                    {/* Payslip */}
                    {stats.latestPayroll && (
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Latest Payslip</h3>
                        <div className="flex items-end gap-3">
                          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={20} /></div>
                          <div>
                            <p className="text-2xl font-light text-gray-900">{formatCurrency(stats.latestPayroll.netSalary)}</p>
                            <p className="text-xs text-gray-400">{stats.latestPayroll.month} {stats.latestPayroll.year}</p>
                          </div>
                          <div className="ml-auto"><Badge status={stats.latestPayroll.status} /></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Leaves */}
                  {stats.recentLeaves?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs text-gray-400 uppercase tracking-wider">Recent Leave Requests</h3>
                        <button onClick={() => navigate("/leave-balance")} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View All</button>
                      </div>
                      <div className="space-y-1">
                        {stats.recentLeaves.map((l: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FileText size={14} /></div>
                              <div>
                                <p className="text-sm text-gray-800">{l.leaveType} · {l.numberOfDays || 1} day(s)</p>
                                <p className="text-[11px] text-gray-400">{new Date(l.leaveStartDate).toLocaleDateString('en-GB')} — {new Date(l.leaveEndDate).toLocaleDateString('en-GB')}</p>
                              </div>
                            </div>
                            <Badge status={l.leaveStatus} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
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
