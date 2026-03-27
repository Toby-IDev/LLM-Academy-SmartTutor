import { useState, useEffect } from "react";

function WrongQuestionsBook({ goBack }) {

    const [data, setData] = useState({});
    const [selectedProject, setSelectedProject] = useState("");

    const fetchWrong = async () => {
        try {
            const res = await fetch("http://localhost:1888/api/getWrongQuestions");
            const result = await res.json();

            const d = result.data || {};
            setData(d);

            const firstProject = Object.keys(d)[0] || "";
            setSelectedProject(firstProject);

        } catch (err) {
            console.error("获取错题失败:", err);
        }
    };

    const deleteWrong = async () => {

        if (!confirm("确定要删除所有错题吗？此操作不可恢复！")) return;

        try {
            const res = await fetch("http://localhost:1888/api/deleteWrongQuestions", {
                method: "DELETE",
            });
            const result = await res.json();

            fetchWrong();

            if (result.success) {
                alert(result.message || "已删除所有错题");
            } else {
                alert(result.error || "删除失败，请重试");
            }
        } catch (err) {
            console.error("删除错题失败:", err);
            alert("删除错题失败，请检查控制台");
        }
    };


    useEffect(() => {

        fetchWrong();
    }, []);


    const projects = Object.keys(data);


    const currentWrongQuestions = data[selectedProject] || [];

    return (
        <div className="flex w-full h-full p-6 gap-6">

            <div className="w-1/4 border-r pr-4">
                <h2 className="text-lg font-semibold mb-4">项目列表</h2>

                {projects.length === 0 ? (
                    <p>暂无项目</p>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project}
                            onClick={() => setSelectedProject(project)}
                            className={`mb-2 px-3 py-2 rounded cursor-pointer ${selectedProject === project
                                ? "bg-black text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            {project}
                        </div>
                    ))
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4">
                    <button
                        onClick={deleteWrong}
                        className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
                    >
                        删除所有错题
                    </button>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
                    >
                        返回
                    </button>
                </div>
            </div>


            <div className="w-3/4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">
                    {selectedProject ? `${selectedProject} 的错题` : "请选择项目"}
                </h2>

                {currentWrongQuestions.length === 0 ? (
                    <p>暂无错题</p>
                ) : (
                    currentWrongQuestions.map((item, idx) => (
                        <div key={idx} className="mb-3 p-3 border rounded bg-red-50">
                            <p><strong>{item.question}</strong></p>
                            <p className="text-red-500">你的答案：{item.yourAnswer}</p>
                            <p className="text-green-600">正确答案：{item.correctAnswer}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WrongQuestionsBook;