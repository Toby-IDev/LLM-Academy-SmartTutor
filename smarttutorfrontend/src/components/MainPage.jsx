import { useState, useEffect } from "react";



function MainPage({ projectName, goBack, setView, setQuestions }) {

    const [fileslists, setFilesLists] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [notesLists, setNotesLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [AIsummaries, setAISummaries] = useState([]);

    const fetchFiles = async () => {
        console.log("Fetching files for project:", projectName);
        const res = await fetch(
            `http://localhost:1888/api/getfiles?projectName=${encodeURIComponent(projectName)}`
        );
        const data = await res.json();
        console.log(data);
        setFilesLists(data.files || []);
    };

    const fetchNotes = async () => {
        const res = await fetch(
            `http://localhost:1888/api/getnotes?projectName=${encodeURIComponent(projectName)}`
        );
        const data = await res.json();
        console.log("notes", data);
        setNotesLists(data.notes || []);
        console.log("notesLists", notesLists);
    };

    const uploadFile = async (file) => {
        const res = await fetch(`http://localhost:1888/api/upload/${encodeURIComponent(projectName)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream", 
                "filename": encodeURIComponent(file.name)
            },
            body: file
        });

        const data = await res.json();
        fetchFiles();
    };

    const toggleSelectFile = (fileName) => {
        setSelectedFiles((prev) =>
            prev.includes(fileName)
                ? prev.filter((f) => f !== fileName)
                : [...prev, fileName]
        );
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();

        if (extension === "pdf") return "../src/assets/pdf.png";
        if (extension === "docx") return "../src/assets/docx.png";
        if (extension === "xlsx") return "../src/assets/xlsx.png";

        return "../src/assets/unknown.png";
    };

    const deleteSelectedFiles = async () => {
        await fetch("http://localhost:1888/api/deleteFiles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                projectName,
                files: selectedFiles,
            }),
        });

        fetchFiles();
        setSelectedFiles([]);
        console.log(fileslists)
    };

    const deleteNote = async (fileName) => {
        try {
            await fetch("http://localhost:1888/api/deleteNote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectName,
                    fileName,
                }),
            });

            fetchNotes();
        } catch (err) {
            console.error("删除失败:", err);
        }
    };


    const getAlSummaries = async () => {
        try {
            setLoading(true);
            setAISummaries([]);

            const res = await fetch(
                `http://localhost:1888/api/fetchFilesAndGetAISummarize?projectName=${encodeURIComponent(projectName)}`
            );

            const data = await res.json();
            const summaries = (data.data || []).map((item) => item.summary);

            console.log("Summaries:", summaries);

            setAISummaries(summaries);

            return summaries;
        } catch (err) {
            console.error(err);
            setAISummaries(["Error fetching summaries"]);
        } finally {
            setLoading(false);
        }
    };


    const saveSummaryPDF = async () => {

        const content = AIsummaries.join("\n\n");

        const date = new Date().toISOString().split("T")[0];

        const hour = new Date().getHours();

        const minute = new Date().getMinutes();

        const second = new Date().getSeconds();

        const res = await fetch("http://localhost:1888/api/saveSummaryPDF", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectName, content, fileName: `${projectName}_summary_${date}_${hour}:${minute}:${second}.pdf` }),
        });

        const data = await res.json();

        fetchNotes();
    };

    const downloadNote = (fileName) => {
        const url = `http://localhost:1888/api/downloadNotes?projectName=${encodeURIComponent(projectName)}&fileName=${encodeURIComponent(fileName)}`;

        window.open(url);
    };


   useEffect(() => {
    if (projectName) {
        fetchFiles();
        fetchNotes();
    }
}, [projectName]);

    return (
        <div className="flex h-full w-full">
            <div className="w-2/5 flex flex-col bg-gray-100 p-4 justify-center items-center gap-2">
                {fileslists.length === 0 ? (<div>
                    <div className="text-gray-600 mb-3 text-sm">目前没有该仓库中没有文件，等待上传</div>
                </div>) : (<div>
                    <div className="text-gray-600 mb-3 text-sm">仓库中总共有 {fileslists.length} 个文件，总大小为 {(fileslists.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB</div>
                </div>)}

                <div className="flex-1 overflow-x-auto">
                    <div className="grid grid-cols-4 gap-20 sm:gap-25 md:gap-30 lg:gap-35 xl:gap-20">

                        {fileslists.map((file) => (
                            <div
                                key={file.name}
                                onClick={() => toggleSelectFile(file.name)}
                                className={`w-20 h-20 md:w-30 md:h-30 rounded-xl shadow cursor-pointer flex flex-col items-center justify-center border-2 transition
    ${selectedFiles.includes(file.name)
                                        ? "border-blue-500 bg-blue-50"
                                        : "bg-white hover:shadow-lg border-transparent"
                                    }`}
                            >
                                {selectedFiles.includes(file.name) && (
                                    <div className="absolute top-1 right-1 text-blue-500 text-sm">✓</div>
                                )}

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
                        上传文件
                    </button>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 text-white text-sm border border-gray-300 bg-black rounded-xl hover:bg-gray-800 transition"
                    >
                        ← 返回首页
                    </button>
                    <button
                        onClick={deleteSelectedFiles}
                        className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:bg-red-600"
                    >
                        删除选中文件
                    </button>
                </div>
            </div>
            <div className="w-3/5 flex items-center flex-col gap-4 p-4">

                <div className="h-80 w-full bg-white flex justify-center items-center rounded-xl border border-gray-300 p-2 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent">
                            </div></div>

                    ) : AIsummaries && AIsummaries.length > 0 ? (
                        <div className="flex flex-col rounded-xl gap-2 h-full w-full">
                            {AIsummaries.map((item, index) => (
                                <p key={index} className="text-left">
                                    {item}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <h1>AI 笔记待生成...</h1>
                    )}
                </div>

                <div className="flex flex-row gap-5 items-center justify-center">
                    <button
                        onClick={getAlSummaries}
                        className="px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800"
                    >
                        生成汇总笔记
                    </button>
                    <button
                        onClick={saveSummaryPDF}
                        className="px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800"
                    >
                        保存汇总笔记
                    </button>
                </div>
                <div className="flex-1 flex flex-col w-full h-full bg-white rounded-xl p-2 border border-gray-300 overflow-y-auto">
                    <div className="text-gray-600 mb-2 font-semibold">已生成笔记</div>
                    {notesLists.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {notesLists.map((note) => (
                                <div
                                    key={note.name}
                                    className="p-2 rounded-md border border-gray-200 bg-gray-50 flex justify-between items-center text-sm hover:bg-gray-100"
                                >
                                    <div
                                        className="flex items-center gap-2 truncate cursor-pointer"
                                        onClick={() => console.log("点击笔记:", note.name)}
                                    >
                                        <img src="../src/assets/notes.png" className="w-5 h-5" />
                                        <span className="truncate">{note.name}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadNote(note.name);
                                            }}
                                            className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                                        >
                                            下载
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNote(note.name);
                                            }}
                                            className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">暂无笔记</div>
                    )}
                    <button
                        onClick={() => setView("testing")}
                        className="mt-3 px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800"
                    >
                        在线测试beta
                    </button>
                </div>
            </div>
        </div>

    )
}

export default MainPage