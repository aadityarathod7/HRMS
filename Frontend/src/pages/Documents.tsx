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

interface FileData {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdDate: string;
}

const Documents: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDir, setSortDir] = useState("desc");
  const [filters, setFilters] = useState({ fileName: "", uploadedBy: "", startDate: "", endDate: "" });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const userRoles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdminOrHR = userRoles.some(r => ["ADMIN", "HR"].includes(r));

  useEffect(() => { fetchFiles(); }, [currentPage, sortBy, sortDir]);

  const fetchFiles = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(currentPage));
      queryParams.append("size", String(pageSize));
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);
      if (filters.fileName.trim()) queryParams.append("fileName", filters.fileName.trim());
      if (filters.uploadedBy.trim()) queryParams.append("uploadedBy", filters.uploadedBy.trim());
      if (filters.startDate && filters.endDate) {
        queryParams.append("startDate", filters.startDate);
        queryParams.append("endDate", filters.endDate);
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/file/filter?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setFiles(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setFiles([]);
        setTotalPages(0);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/file/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("File deleted");
      fetchFiles();
    } catch (err) { toast.error("Failed to delete file"); }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${checkedFiles.length} files?`)) return;
    try {
      const token = localStorage.getItem("token");
      await Promise.all(checkedFiles.map(id => axios.delete(`http://localhost:5000/file/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      toast.success("Files deleted");
      setCheckedFiles([]);
      fetchFiles();
    } catch (err) { toast.error("Failed to delete files"); }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));
    formData.append("uploadedBy", localStorage.getItem("username") || "anonymous");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/file/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Files uploaded successfully");
        await fetchFiles();
        setSelectedFiles([]);
      }
    } catch (error) { toast.error("Failed to upload files"); }
    finally { setIsUploading(false); }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSort = (column: string) => {
    setSortDir(sortBy === column && sortDir === "asc" ? "desc" : "asc");
    setSortBy(column);
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`flex flex-col flex-grow w-full transition-all duration-300 ${isCollapsed ? "pl-20 pr-6" : "pl-72 pr-6"}`}>
        <div className="pt-28 px-5 pb-5 flex-grow">

          {/* Action bar */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex gap-2 items-center">
              {isAdminOrHR && (
                <>
                  <button
                    className="border border-blue-600 text-blue-600 bg-white px-5 py-2 rounded-md hover:bg-blue-50 transition text-sm"
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    Browse Files
                  </button>
                  <input type="file" id="file-input" multiple accept="*/*" className="hidden"
                    onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                  />
                  <button
                    className={`bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                  {selectedFiles.length > 0 && (
                    <button className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm" onClick={() => setSelectedFiles([])}>
                      Clear ({selectedFiles.length})
                    </button>
                  )}
                  {checkedFiles.length > 0 && (
                    <button className="bg-red-50 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-100 transition text-sm" onClick={handleDeleteSelected}>
                      Delete ({checkedFiles.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 mb-5">
              <p className="text-sm text-blue-700 mb-2">Selected files:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <span key={i} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-blue-200 flex items-center gap-2">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    <button onClick={() => setSelectedFiles(f => f.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Name</label>
                <input type="text" name="fileName" placeholder="Search..." value={filters.fileName}
                  onChange={(e) => setFilters(prev => ({ ...prev, fileName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Uploaded By</label>
                <input type="text" name="uploadedBy" placeholder="Search..." value={filters.uploadedBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, uploadedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <DateInput value={filters.startDate}
                  onChange={(v) => setFilters(prev => ({ ...prev, startDate: v }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <DateInput value={filters.endDate}
                  onChange={(v) => setFilters(prev => ({ ...prev, endDate: v }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm" onClick={fetchFiles}>
                  Filter
                </button>
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm"
                  onClick={() => { setFilters({ fileName: "", uploadedBy: "", startDate: "", endDate: "" }); fetchFiles(); }}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {isAdminOrHR && (
                    <th className="p-3 w-10">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                        onChange={(e) => setCheckedFiles(e.target.checked ? files.map(f => f.id) : [])}
                        checked={checkedFiles.length === files.length && files.length > 0}
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("fileName")}>
                    File Name {sortBy === "fileName" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("fileType")}>
                    Type {sortBy === "fileType" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("fileSize")}>
                    Size {sortBy === "fileSize" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("uploadedBy")}>
                    Uploaded By {sortBy === "uploadedBy" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("createdDate")}>
                    Date {sortBy === "createdDate" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : files.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No documents found</td></tr>
                ) : files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    {isAdminOrHR && (
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={checkedFiles.includes(file.id)}
                          onChange={(e) => setCheckedFiles(prev => e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id))}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-800 text-sm">{file.fileName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700">{file.fileType.split("/").pop()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{formatFileSize(file.fileSize)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{file.uploadedBy}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{new Date(file.createdDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/view/${file.id}`} className="text-blue-600 hover:text-blue-800">
                          <Visibility fontSize="small" />
                        </Link>
                        {isAdminOrHR && (
                          <button onClick={() => handleDelete(file.id)} className="text-red-400 hover:text-red-600">
                            <DeleteIcon fontSize="small" />
                          </button>
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
            <div className="mt-4 flex justify-center items-center gap-2">
              <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}
                className={`px-3 py-1.5 rounded text-sm ${currentPage === 0 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                First
              </button>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className={`px-3 py-1.5 rounded text-sm ${currentPage === 0 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                Prev
              </button>
              <span className="text-sm text-gray-600 px-3">Page {currentPage + 1} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                className={`px-3 py-1.5 rounded text-sm ${currentPage >= totalPages - 1 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                Next
              </button>
              <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}
                className={`px-3 py-1.5 rounded text-sm ${currentPage >= totalPages - 1 ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                Last
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Documents;
