import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";

const View: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";

    const isTextFile = (fileType: string) => {
        return fileType?.startsWith("text/") || fileType === "application/json";
    };

    useEffect(() => {
        const fetchFile = async () => {
            try {
                // First get file metadata from filter
                const metaRes = await axios.get(`http://localhost:5000/file/filter?page=0&size=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Find the file info by checking all files
                const allFiles = await axios.get(`http://localhost:5000/file/filter?page=0&size=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const file = allFiles.data.content?.find((f: any) => f.id === id || f._id === id);
                setFileInfo(file);

                if (file && isTextFile(file.fileType)) {
                    // Text files: fetch content as text
                    const contentRes = await axios.get(`http://localhost:5000/file/get-file-content/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setFileContent(contentRes.data.content);
                    setEditedContent(contentRes.data.content);
                }
            } catch (err) {
                setError("Error fetching file details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchFile();
    }, [id]);

    const handleSaveChanges = async () => {
        try {
            await axios.put(`http://localhost:5000/file/update/${id}`, { newContent: editedContent }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFileContent(editedContent);
            setIsEditing(false);
        } catch (err) {
            setError("Error saving file");
        }
    };

    const fileUrl = `http://localhost:5000/file/download/${id}?token=${token}`;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <DashboardSidebar isCollapsed={isCollapsed} />
            <div className="flex-1">
                <DashboardNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
                <main className={`transition-all ${isCollapsed ? "pl-20" : "pl-72"} pr-6 pt-28 px-6 pb-6`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-light text-gray-800">File Preview</h1>
                            <div className="flex space-x-2">
                                {fileInfo && isTextFile(fileInfo.fileType) && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                                    >
                                        Edit
                                    </button>
                                )}
                                {fileInfo && !isTextFile(fileInfo.fileType) && (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                                    >
                                        Download
                                    </a>
                                )}
                                <button
                                    onClick={() => navigate(-1)}
                                    className="border border-gray-300 text-gray-600 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm"
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        {loading && <p className="text-gray-600">Loading file...</p>}
                        {error && <p className="text-red-600">{error}</p>}

                        {!loading && fileInfo && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="mb-4 text-sm text-gray-500">
                                    <span className="font-medium text-gray-700">{fileInfo.fileName}</span>
                                    <span className="ml-3">{fileInfo.fileType}</span>
                                    <span className="ml-3">{(fileInfo.fileSize / 1024).toFixed(1)} KB</span>
                                </div>

                                {isTextFile(fileInfo.fileType) ? (
                                    // Text/CSV files
                                    <div>
                                        {isEditing ? (
                                            <>
                                                <textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                    className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={handleSaveChanges}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsEditing(false); setEditedContent(fileContent || ""); }}
                                                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm font-mono bg-gray-50 p-4 rounded">{fileContent}</pre>
                                        )}
                                    </div>
                                ) : fileInfo.fileType === "application/pdf" ? (
                                    // PDF files
                                    <iframe
                                        src={fileUrl}
                                        width="100%"
                                        height="600px"
                                        className="rounded border border-gray-200"
                                        title="PDF Preview"
                                    />
                                ) : fileInfo.fileType?.startsWith("image/") ? (
                                    // Image files
                                    <img src={fileUrl} alt={fileInfo.fileName} className="max-w-full h-auto rounded" />
                                ) : (
                                    // Other files
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 mb-4">This file type cannot be previewed.</p>
                                        <a
                                            href={fileUrl}
                                            download={fileInfo.fileName}
                                            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-500 transition text-sm"
                                        >
                                            Download File
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default View;
