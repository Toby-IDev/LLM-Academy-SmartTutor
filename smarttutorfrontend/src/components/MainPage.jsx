import { useState, useEffect } from "react";



function MainPage({ projectName, goBack }) {

    const [fileslists, setFilesLists] = useState([]);

    const fetchFiles = async () => {
        const res = await fetch(
            `http://localhost:1888/api/getfiles?projectName=${encodeURIComponent(projectName)}`
        );
        const data = await res.json();
        console.log(data);
        setFilesLists(data.files || []);
    };

    const uploadFile = async (file, projectName) => {
        const res = await fetch(`http://localhost:1888/api/upload/${projectName.projectName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream", // raw file
                "filename": encodeURIComponent(file.name)
            },
            body: file
        });

        const data = await res.json();
        fetchFiles();
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();

        if (extension === "pdf") return "../src/assets/pdf.png";
        if (extension === "docx") return "../src/assets/docx.png";
        if (extension === "xlsx") return "../src/assets/xlsx.png";

        return "../src/assets/unknown.png";
    };

    useEffect(() => {
        fetchFiles();

    }, []);

    return (
        <div className="flex h-full w-full">
            <div className="w-1/2 flex flex-col bg-gray-100 p-4">

                <div className="flex-1 overflow-x-auto">
                    <div className="grid grid-cols-4 gap-3">
                        {fileslists.map((file) => (
                            <div
                                key={file}
                                className="w-40 h-40 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer flex flex-col overflow-hidden"
                            >
                                <img src={getFileIcon(file)} className="h-20 object-contain" />
                                <div className="flex flex-col justify-center px-2 py-2 text-left flex-1">
                                    <div className="text-md font-semibold text-gray-800">
                                        {file}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex gap-4 items-center justify-center">
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            uploadFile(file, { projectName });
                        }}
                    />
                    <button
                        onClick={() => document.getElementById("fileInput").click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Upload File
                    </button>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 bg-gray-200 rounded"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>

    )
}

export default MainPage