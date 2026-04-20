import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import Footer from "@/components/Footer";
import DateInput from "@/components/DateInput";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Upload, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  userId: any;
  createdDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: any;
  reviewedAt?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const s: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-600",
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${s[status] || "bg-gray-50 text-gray-600"}`}>{status}</span>;
};

const Documents: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ fileName: "", startDate: "", endDate: "" });
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = roles.some(r => ["ADMIN", "HR"].includes(r));
  const pageSize = 10;

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("size", String(pageSize));
      params.append("sortBy", "createdDate");
      params.append("sortDir", "desc");
      if (filters.fileName.trim()) params.append("fileName", filters.fileName.trim());
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await axios.get(`${API_URL}/file/filter?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setFiles(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) { toast.error("Failed to load documents"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, [currentPage]);

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(f => formData.append("files", f));
    documentNames.forEach(name => formData.append("documentNames", name));
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/file/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Documents uploaded successfully");
      setSelectedFiles([]);
      setDocumentNames([]);
      fetchFiles();
    } catch { toast.error("Failed to upload"); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/file/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Document deleted");
      fetchFiles();
    } catch { toast.error("Failed to delete"); }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/file/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Document approved");
      fetchFiles();
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/file/reject/${rejectModal.id}`, { reason: rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Document rejected");
      setRejectModal(null);
      setRejectReason("");
      fetchFiles();
    } catch { toast.error("Failed to reject"); }
  };

  const formatSize = (size: number) => size < 1024 ? `${size} B` : size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(2)} MB`;

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Documents</h1>
              <p className="text-sm text-gray-400 mt-1">{isAdminOrHR ? "Review and manage employee documents" : "Upload and track your documents"}</p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Upload Documents</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                <Upload size={14} />
                Browse Files
                <input type="file" multiple className="hidden" onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </label>
              {selectedFiles.length > 0 && (
                <button onClick={handleUpload} disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500 transition">
                  {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} file(s)`}
                </button>
              )}
              {selectedFiles.length > 0 && (
                <button onClick={() => setSelectedFiles([])} className="text-sm text-gray-400 hover:text-gray-600">Clear</button>
              )}
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate w-32">{f.name}</span>
                    <input
                      type="text"
                      placeholder="Document name (e.g. Aadhar Card)"
                      value={documentNames[i] || ""}
                      onChange={e => {
                        const updated = [...documentNames];
                        updated[i] = e.target.value;
                        setDocumentNames(updated);
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button onClick={() => {
                      setSelectedFiles(p => p.filter((_, j) => j !== i));
                      setDocumentNames(p => p.filter((_, j) => j !== i));
                    }} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Name</label>
                <input type="text" placeholder="Search..." value={filters.fileName} onChange={e => setFilters(p => ({...p, fileName: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">From</label><DateInput value={filters.startDate} onChange={v => setFilters(p => ({...p, startDate: v}))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">To</label><DateInput value={filters.endDate} onChange={v => setFilters(p => ({...p, endDate: v}))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
              <div className="flex gap-2">
                <button onClick={() => { setCurrentPage(0); fetchFiles(); }} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500 transition">Filter</button>
                <button onClick={() => { setFilters({ fileName: "", startDate: "", endDate: "" }); setCurrentPage(0); fetchFiles(); }} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition">Reset</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {isAdminOrHR && <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Employee</th>}
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">File Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Size</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={isAdminOrHR ? 7 : 6} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : files.length === 0 ? (
                  <tr><td colSpan={isAdminOrHR ? 7 : 6} className="px-4 py-8 text-center text-gray-400 text-sm">No documents found</td></tr>
                ) : files.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    {isAdminOrHR && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {typeof file.userId === "object" ? `${file.userId.firstname} ${file.userId.lastname}` : file.uploadedBy}
                        {typeof file.userId === "object" && file.userId.employeeId && (
                          <p className="text-[11px] text-gray-400">{file.userId.employeeId}</p>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                      <p className="truncate">{(file as any).documentName || file.fileName}</p>
                      {(file as any).documentName && <p className="text-[10px] text-gray-400 truncate">{file.fileName}</p>}
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 text-[11px] rounded bg-blue-50 text-blue-700">{file.fileType?.split("/").pop()}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatSize(file.fileSize)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(file.createdDate).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <div>
                        <StatusBadge status={file.status || "PENDING"} />
                        {file.status === "REJECTED" && file.rejectionReason && (
                          <p className="text-[10px] text-red-500 mt-0.5">{file.rejectionReason}</p>
                        )}
                        {file.status === "APPROVED" && file.reviewedBy && (
                          <p className="text-[10px] text-gray-400 mt-0.5">by {typeof file.reviewedBy === "object" ? `${file.reviewedBy.firstname} ${file.reviewedBy.lastname}` : file.reviewedBy}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`${API_URL}/file/view/${file.id}?token=${localStorage.getItem("token")}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700" title="View"><Visibility fontSize="small" /></a>
                        <a href={`${API_URL}/file/download/${file.id}?token=${localStorage.getItem("token")}`} download={file.fileName} className="text-gray-400 hover:text-blue-600" title="Download">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                        {isAdminOrHR && file.status === "PENDING" && (
                          <>
                            <button onClick={() => handleApprove(file.id)} className="text-emerald-600 hover:text-emerald-800" title="Approve"><CheckCircle size={16} /></button>
                            <button onClick={() => setRejectModal({ id: file.id, name: file.fileName })} className="text-red-500 hover:text-red-700" title="Reject"><XCircle size={16} /></button>
                          </>
                        )}
                        {(isAdminOrHR || file.uploadedBy === localStorage.getItem("username")) && (
                          <button onClick={() => handleDelete(file.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon fontSize="small" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className={`px-3 py-1.5 rounded text-sm ${currentPage === 0 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>Prev</button>
              <span className="text-sm text-gray-500">Page {currentPage + 1} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className={`px-3 py-1.5 rounded text-sm ${currentPage >= totalPages - 1 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>Next</button>
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-light text-gray-900 mb-1">Reject Document</h3>
            <p className="text-sm text-gray-500 mb-4">"{rejectModal.name}"</p>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Reason for Rejection</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" placeholder="Explain why this document is rejected..." />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="bg-red-500 text-white px-5 py-2 rounded-md text-sm hover:bg-red-600 transition">Reject</button>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-md text-sm hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
