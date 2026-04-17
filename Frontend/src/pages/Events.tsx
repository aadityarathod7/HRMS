import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import DateInput from "@/components/DateInput";
import { toast } from "react-toastify";
import { Calendar, List, ChevronLeft, ChevronRight, Gift, Star, Users, Briefcase, BookOpen, Award } from "lucide-react";

const EVENT_TYPES = ["COMPANY_EVENT", "TEAM_EVENT", "TRAINING", "HOLIDAY", "BIRTHDAY", "WORK_ANNIVERSARY"];
const ALL_TYPES = ["BIRTHDAY", "HOLIDAY", "COMPANY_EVENT", "TEAM_EVENT", "TRAINING", "WORK_ANNIVERSARY"];

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  BIRTHDAY: { color: "text-amber-700", bg: "bg-amber-50", icon: Gift, label: "Birthday" },
  HOLIDAY: { color: "text-red-600", bg: "bg-red-50", icon: Star, label: "Holiday" },
  COMPANY_EVENT: { color: "text-blue-700", bg: "bg-blue-50", icon: Users, label: "Company Event" },
  TEAM_EVENT: { color: "text-purple-700", bg: "bg-purple-50", icon: Briefcase, label: "Team Event" },
  TRAINING: { color: "text-green-700", bg: "bg-green-50", icon: BookOpen, label: "Training" },
  WORK_ANNIVERSARY: { color: "text-teal-700", bg: "bg-teal-50", icon: Award, label: "Work Anniversary" },
};

const Events: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", eventType: "COMPANY_EVENT", date: "", endDate: "", time: "", location: "", isAllDay: true });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const canCreate = roles.some(r => ["ADMIN", "HR", "MANAGER"].includes(r));

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}/events/all?month=${currentMonth}&year=${currentYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [currentMonth, currentYear]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Event created");
      setForm({ title: "", description: "", eventType: "COMPANY_EVENT", date: "", endDate: "", time: "", location: "", isAllDay: true });
      setShowForm(false);
      fetchEvents();
    } catch (err) { toast.error("Failed to create event"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}/events/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Event deleted");
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) { toast.error("Failed to delete"); }
  };

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString("en", { month: "long" });

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const filteredEvents = activeFilter ? events.filter(e => e.eventType === activeFilter) : events;

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() + 1 === currentMonth;
    });
  };

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <DashboardSidebar isCollapsed={isCollapsed} />
      <DashboardNavbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light text-gray-900">Events & Calendar</h1>
            <div className="flex gap-2">
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("calendar")} className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "calendar" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Calendar size={14} /> Calendar
                </button>
                <button onClick={() => setView("list")} className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  <List size={14} /> List
                </button>
              </div>
              {canCreate && (
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm">
                  {showForm ? "Cancel" : "+ Add Event"}
                </button>
              )}
            </div>
          </div>

          {/* Add Event Form */}
          {showForm && canCreate && (
            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2"><label className={labelClass}>Title</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Event title" /></div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className={inputClass}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Location</label><input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="Office / Virtual" /></div>
                <div><label className={labelClass}>Date</label><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} required className={inputClass} /></div>
                <div><label className={labelClass}>End Date</label><DateInput value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} className={inputClass} /></div>
                <div><label className={labelClass}>Time</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass} /></div>
                <div className="flex items-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition text-sm w-full">Create Event</button></div>
              </div>
              <div className="mt-3"><label className={labelClass}>Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Optional description" /></div>
            </form>
          )}

          {/* Filter Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setActiveFilter(null)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${activeFilter === null ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              All
            </button>
            {ALL_TYPES.map(t => {
              const c = TYPE_CONFIG[t];
              const isActive = activeFilter === t;
              return (
                <button key={t} onClick={() => setActiveFilter(isActive ? null : t)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${isActive ? "ring-2 ring-offset-1 ring-blue-400 " + c.bg + " " + c.color : c.bg + " " + c.color + " hover:opacity-80"}`}>
                  <c.icon size={12} /> {c.label}
                </button>
              );
            })}
          </div>

          {/* Calendar View */}
          {view === "calendar" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Month Nav */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md"><ChevronLeft size={16} /></button>
                <div className="flex items-center gap-2">
                  <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-1">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>
                    ))}
                  </select>
                  <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none">
                    {Array.from({ length: 5 }, (_, i) => {
                      const y = new Date().getFullYear() - 1 + i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                  <button onClick={() => { setCurrentMonth(new Date().getMonth() + 1); setCurrentYear(new Date().getFullYear()); }} className="text-[11px] text-blue-600 hover:text-blue-800 ml-2">Today</button>
                </div>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md"><ChevronRight size={16} /></button>
              </div>

              {/* Day Headers */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <th key={d} className="py-2 text-[11px] text-gray-400 uppercase tracking-wider font-medium text-center border-b border-gray-100 w-[14.28%]">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, week) => (
                    <tr key={week}>
                      {calendarDays.slice(week * 7, week * 7 + 7).map((day, i) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        return (
                          <td key={i} className={`h-[72px] border border-gray-50 p-1 align-top ${day ? "hover:bg-gray-50 cursor-pointer" : ""} ${isToday(day!) ? "bg-blue-50/50" : ""}`}>
                            {day && (
                              <>
                                <div className="text-right">
                                  <span className={`text-[11px] inline-block ${isToday(day) ? "bg-blue-600 text-white w-5 h-5 rounded-full leading-5 text-center" : "text-gray-500"}`}>{day}</span>
                                </div>
                                <div className="mt-0.5 space-y-px">
                                  {dayEvents.slice(0, 2).map((e: any, j: number) => {
                                    const c = TYPE_CONFIG[e.eventType] || TYPE_CONFIG.COMPANY_EVENT;
                                    return (
                                      <div key={j} onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }} className={`${c.bg} ${c.color} text-[9px] leading-tight px-1 py-px rounded truncate cursor-pointer`}>
                                        {e.title}
                                      </div>
                                    );
                                  })}
                                  {dayEvents.length > 2 && <div className="text-[9px] text-gray-400 px-1">+{dayEvents.length - 2}</div>}
                                </div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* List View */}
          {view === "list" && (
            <div>
              {/* Month selector for list view */}
              <div className="flex items-center gap-2 mb-4">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md"><ChevronLeft size={16} /></button>
                <span className="text-sm font-medium text-gray-900 min-w-[130px] text-center">{monthName} {currentYear}</span>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md"><ChevronRight size={16} /></button>
                <button onClick={() => { setCurrentMonth(new Date().getMonth() + 1); setCurrentYear(new Date().getFullYear()); }} className="text-xs text-blue-600 hover:text-blue-800 ml-2">Today</button>
                <span className="text-xs text-gray-400 ml-auto">{filteredEvents.length} event(s)</span>
              </div>

              {/* Event list */}
              <div className="space-y-2">
                {loading ? <p className="text-gray-400">Loading...</p> :
                  filteredEvents.length === 0 ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">{activeFilter ? `No ${TYPE_CONFIG[activeFilter]?.label} events in ${monthName} ${currentYear}` : `No events in ${monthName} ${currentYear}`}</div> :
                  filteredEvents.map((e: any, i: number) => {
                    const c = TYPE_CONFIG[e.eventType] || TYPE_CONFIG.COMPANY_EVENT;
                    const Icon = c.icon;
                    return (
                      <div key={e.id || i} onClick={() => setSelectedEvent(e)} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 hover:border-blue-200 cursor-pointer transition">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}><Icon size={18} /></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-GB')} {e.time || ""} {e.location ? `· ${e.location}` : ""}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs ${c.bg} ${c.color}`}>{c.label}</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* Event Detail Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const c = TYPE_CONFIG[selectedEvent.eventType] || TYPE_CONFIG.COMPANY_EVENT;
                  const Icon = c.icon;
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}><Icon size={20} /></div>
                        <div>
                          <h3 className="text-lg font-light text-gray-900">{selectedEvent.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${c.bg} ${c.color}`}>{c.label}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="text-gray-400">Date:</span> {new Date(selectedEvent.date).toLocaleDateString('en-GB')}{selectedEvent.endDate ? ` — ${new Date(selectedEvent.endDate).toLocaleDateString('en-GB')}` : ""}</p>
                        {selectedEvent.time && <p><span className="text-gray-400">Time:</span> {selectedEvent.time}</p>}
                        {selectedEvent.location && <p><span className="text-gray-400">Location:</span> {selectedEvent.location}</p>}
                        {selectedEvent.description && <p><span className="text-gray-400">Description:</span> {selectedEvent.description}</p>}
                        {selectedEvent.createdBy && <p><span className="text-gray-400">Created by:</span> {selectedEvent.createdBy.firstname} {selectedEvent.createdBy.lastname}</p>}
                      </div>
                      <div className="flex gap-2 mt-5">
                        <button onClick={() => setSelectedEvent(null)} className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm flex-1">Close</button>
                        {canCreate && !selectedEvent._generated && (
                          <button onClick={() => handleDelete(selectedEvent.id || selectedEvent._id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition text-sm">Delete</button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Events;
