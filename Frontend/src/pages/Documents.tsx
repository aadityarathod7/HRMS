import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import { Box, Typography, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Footer from "@/components/Footer";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10;

  // Sorting state
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

  // Filter state
  const [filters, setFilters] = useState({
    fileName: "",
    uploadedBy: "",
    startDate: "",
    endDate: "",
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPage, sortBy, sortDir]);

  const fetchFiles = async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append("page", String(currentPage));
      queryParams.append("size", String(pageSize));

      // Add sorting params
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);

      if (filters.fileName.trim()) {
        queryParams.append("fileName", filters.fileName.trim());
      }
      if (filters.uploadedBy.trim()) {
        queryParams.append("uploadedBy", filters.uploadedBy.trim());
      }
      if (filters.startDate && filters.endDate) {
        queryParams.append("startDate", filters.startDate);
        queryParams.append("endDate", filters.endDate);
      }

      const token = localStorage.getItem("token");
      const response = await axios.get<PageResponse>(
        `http://localhost:5000/file/filter?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setFiles(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setFiles([]);
        setTotalPages(0);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try again later.");
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      fileName: "",
      uploadedBy: "",
      startDate: "",
      endDate: "",
    });
    fetchFiles();
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/file/delete/${id}`);
      setFiles(files.filter((file) => file.id !== id));
      setCheckedFiles((prev) => prev.filter((fileId) => fileId !== id));
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file.");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const selectedDocs = checkedFiles;
      const promises = selectedDocs.map((id) =>
        axios.delete(`http://localhost:5000/file/delete/${id}`)
      );
      await Promise.all(promises);
      setFiles(files.filter((file) => !selectedDocs.includes(file.id)));
      setCheckedFiles([]);
    } catch (err) {
      console.error("Error deleting selected files:", err);
      alert("Failed to delete selected files.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const username = localStorage.getItem("username");
      formData.append("uploadedBy", username || "anonymous");

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/file/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          setUploadMessage("File uploaded successfully");
          setTimeout(() => setUploadMessage(null), 3000);
          await fetchFiles();
          setSelectedFiles([]);
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Failed to upload files. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
  };

  const handleSelectFile = (fileId: number, isSelected: boolean) => {
    setCheckedFiles((prev) =>
      isSelected ? [...prev, fileId] : prev.filter((id) => id !== fileId)
    );
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSort = (column: string) => {
    const newSortDir = sortBy === column && sortDir === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortDir(newSortDir);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 flex flex-col ${
          isCollapsed ? "ml-[70px]" : "ml-[240px]"
        } mt-24`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-4">
          <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4 md:p-6">
            <div className="mb-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 mr-2"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                Browse
              </button>
              <input
                type="file"
                id="file-input"
                multiple
                accept="*/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 mr-2 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>

              {selectedFiles.length > 0 && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
              {checkedFiles.length > 1 && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </button>
              )}
            </div>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">
                Filter Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    File Name
                  </label>
                  <input
                    type="text"
                    name="fileName"
                    placeholder="Enter file name"
                    value={filters.fileName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Uploaded By
                  </label>
                  <input
                    type="text"
                    name="uploadedBy"
                    placeholder="Enter uploader name"
                    value={filters.uploadedBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                  onClick={fetchFiles}
                >
                  Apply Filters
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Selected Files Preview */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {selectedFiles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-800">
                    Selected Files
                  </h3>
                  <div className="bg-white rounded-lg shadow-md p-1.5 border border-gray-200">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 border-b last:border-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium text-gray-800 break-all">
                            {file.name}
                          </span>
                          <span className="text-gray-600">
                            ({file.name.split(".").pop()})
                          </span>
                          <span className="text-gray-600">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() =>
                            setSelectedFiles((files) =>
                              files.filter((_, i) => i !== index)
                            )
                          }
                          title="Remove"
                        >
                          <DeleteIcon style={{ color: "red" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loading && <p>Loading files...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {uploadMessage && (
              <div className="text-blue-600">{uploadMessage}</div>
            )}

            {/* File List Table */}
            {files.length > 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-3 font-medium text-gray-700">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                              onChange={(e) => {
                                const allFileIds = files.map((file) => file.id);
                                setCheckedFiles(
                                  e.target.checked ? allFileIds : []
                                );
                              }}
                              checked={
                                checkedFiles.length === files.length &&
                                files.length > 0
                              }
                            />
                          </th>
                          <th
                            className="p-3 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort("fileName")}
                          >
                            File Name{" "}
                            {sortBy === "fileName" && (
                              <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                          <th
                            className="p-3 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort("fileType")}
                          >
                            File Type{" "}
                            {sortBy === "fileType" && (
                              <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                          <th
                            className="p-3 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort("fileSize")}
                          >
                            File Size{" "}
                            {sortBy === "fileSize" && (
                              <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                          <th
                            className="p-3 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort("uploadedBy")}
                          >
                            Uploaded By{" "}
                            {sortBy === "uploadedBy" && (
                              <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                          <th
                            className="p-3 font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort("createdDate")}
                          >
                            Created Date{" "}
                            {sortBy === "createdDate" && (
                              <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                          <th className="p-3 font-medium text-gray-700 text-left">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {files.map((file) => {
                          const formattedDate = new Date(
                            file.createdDate
                          ).toLocaleDateString();
                          const fileExtension = file.fileType.split("/").pop();
                          return (
                            <tr
                              key={file.id}
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  checked={checkedFiles.includes(file.id)}
                                  onChange={(e) =>
                                    handleSelectFile(file.id, e.target.checked)
                                  }
                                />
                              </td>
                              <td className="p-3 text-gray-700">
                                {file.fileName}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {fileExtension}
                                </span>
                              </td>
                              <td className="p-3 text-gray-600">
                                {formatFileSize(file.fileSize)}
                              </td>
                              <td className="p-3 text-gray-600">
                                {file.uploadedBy}
                              </td>
                              <td className="p-3 text-gray-600">
                                {formattedDate}
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/view/${file.id}`}
                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                  >
                                    <Visibility />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(file.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                  >
                                    <DeleteIcon />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Grid>
              </Grid>
            )}

            {/* Pagination */}
            {files.length > 0 && (
              <div className="mt-0.5 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className={`p-2 border rounded ${
                    currentPage === 0 ? "bg-white" : "bg-blue-600 text-white"
                  }`}
                >
                  <FaAngleDoubleLeft size={10} />
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentPage === 0}
                  className={`p-2 border rounded ${
                    currentPage === 0 ? "bg-white" : "bg-blue-600 text-white"
                  }`}
                >
                  <FaAngleLeft size={10} />
                </button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="caption" color="text.primary">
                    Page {currentPage + 1} of {totalPages}
                  </Typography>
                </Box>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 border rounded ${
                    currentPage >= totalPages - 1
                      ? "bg-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <FaAngleRight size={10} />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 border rounded ${
                    currentPage >= totalPages - 1
                      ? "bg-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <FaAngleDoubleRight size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-[70px]" : "ml-[240px]"
        }`}
      >
        <Footer />
      </div>
    </div>
  );
};

export default Documents;
