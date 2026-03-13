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
            <div className="w-1/2 flex flex-col bg-gray-100 p-4 justify-center items-center gap-2">
                {fileslists.length === 0 ? (<div>
                    <div className="text-gray-600 mb-3">There are no files to display. Waiting for your upload</div>
                </div>) : (<div>
                    <div className="text-gray-600 mb-3">There are {fileslists.length} files, total size: {(fileslists.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB</div>
                </div>)}

                <div className="flex-1 overflow-x-auto">
                    <div className="grid grid-cols-4 gap-20 sm:gap-25 md:gap-30 lg:gap-10 xl:gap-5">

                        {fileslists.map((file) => (
                            <div
                                key={file.name}
                                className="w-20 h-20 md:w-30 md:h-30 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center"
                            >

                                <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center">
                                    <img
                                        src={getFileIcon(file.name)}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                <div className="w-full text-center px-2 mt-1">
                                    <div className="text-xs md:text-sm font-semibold text-gray-800 truncate">
                                        {file.name}
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
                        className="px-4 py-2 text-white text-sm border border-gray-300 bg-black rounded-xl hover:bg-gray-800 transition"
                    >
                        Upload File
                    </button>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 text-white text-sm border border-gray-300 bg-black rounded-xl hover:bg-gray-800 transition"
                    >
                        ← Back
                    </button>
                </div>
            </div>
            <div className="w-1/2 flex flex-col  p-4 justify-center items-center gap-2">
                <div className="h-2/3 w-full bg-white"><h1>AI Generator Area</h1></div>
                <div className="h-2/3 w-full bg-white"><h1>AI Generator Area</h1></div>
            </div>
        </div>

    )
}

export default MainPage