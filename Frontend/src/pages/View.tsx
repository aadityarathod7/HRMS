import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardNavbar from "@/components/Navbar";
import DashboardSidebar from "@/components/Sidebar";

const View: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileIdToEdit, setFileIdToEdit] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFileDetails = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const response = await axios.get(`http://localhost:5000/file/get-file-content/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFileContent(response.data);
            } catch (error) {
                setError('Error fetching file details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchFileDetails();
    }, [id]);

    const loadFileContent = async (fileId: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            const response = await axios.get(`http://localhost:5000/file/get-file-content/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("File Content:", response.data);
            console.log("Content-Type:", response.headers["content-type"]);

            setFileContent(response.data);
            setFileType(response.headers["content-type"] || "text/plain");
            setFileName(`file-${fileId}`);
            setEditedContent(response.data);
        } catch (err) {
            console.error("Error fetching file content:", err);
            setError("Failed to load file content");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (fileIdToEdit !== null) {
            await handleEditFile(fileIdToEdit, editedContent);
            loadFileContent(fileIdToEdit); 
            setFileIdToEdit(null);
        }
    };

    const handleEditFile = async (fileId: string, content: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            const response = await axios.put(`http://localhost:5000/file/update/${fileId}`, { newContent: content }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("File edited successfully:", response.data);
        } catch (err) {
            console.error("Error editing file:", err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <DashboardSidebar isCollapsed={isCollapsed} />
            <div className="flex-1">
                <DashboardNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
                <main className={`transition-all ${isCollapsed ? "ml-20" : "ml-80"} mr-20 mt-5 p-6`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl mt-20 font-bold text-gray-800">File Preview</h1>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        loadFileContent(id);
                                        setFileIdToEdit(id);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:from-blue-500 hover:to-purple-500 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-400 transition"
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        {loading && <p className="text-gray-600">Loading file...</p>}
                        {error && <p className="text-red-600">{error}</p>}

                        {fileContent && !loading && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {/* If the content is a plain string, display it as text */}
                                {fileType?.startsWith("text") || typeof fileContent === "string" ? (
                                    <div>
                                        {fileIdToEdit === id ? (
                                            <textarea
                                                value={editedContent}
                                                onChange={(e) => setEditedContent(e.target.value)}
                                                className="w-full h-64 p-2 border border-gray-300 rounded-lg"
                                            />
                                        ) : (
                                            <pre className="whitespace-pre-wrap break-words text-gray-800">{fileContent}</pre>
                                        )}
                                        {fileIdToEdit === id && (
                                            <button 
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2" 
                                                onClick={handleSaveChanges}
                                            >
                                                Save Changes
                                            </button>
                                        )}
                                    </div>
                                ) : fileType?.startsWith("image") ? (
                                    <img src={`data:${fileType};base64,${fileContent}`} alt="Preview" className="max-w-full h-auto" />
                                ) : fileType?.includes("pdf") ? (
                                    <iframe src={`data:${fileType};base64,${fileContent}`} width="100%" height="500px"></iframe>
                                ) : (
                                    <div>
                                        <p className="text-gray-600">This file cannot be previewed.</p>
                                        <a href={`data:${fileType};base64,${fileContent}`} download={fileName} className="text-blue-600 underline">
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
