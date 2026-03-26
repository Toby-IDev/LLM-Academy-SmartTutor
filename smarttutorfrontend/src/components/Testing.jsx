import { useEffect, useState } from "react";

function Testing({ projectName, goBack, setWrongQuestionsGlobal }) {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [finished, setFinished] = useState(false);


    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summary, setSummary] = useState([]);



    useEffect(() => {
        const fetchQuestions = async () => {
            setQuestions([]);
            try {
                const res = await fetch(
                    `http://localhost:1888/api/fetchQuestionsBasedOnSummaries?projectName=${encodeURIComponent(projectName)}`
                );
                const data = await res.json();
                setQuestions(data.data || []);
            } catch (err) {
                console.error("获取题目失败:", err);
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        };

        if (projectName) fetchQuestions();
    }, [projectName]);

    const handleAnswer = async (selectedKey) => {
        const currentQ = questions[currentIndex];
        if (!currentQ || !currentQ.options) return;

        if (selectedKey === currentQ.answer) {
            setScore((prev) => prev + 1);
        } else {
            const wrongItem = {
                projectName,
                question: currentQ.question,
                yourAnswer: `${selectedKey}.${currentQ.options[selectedKey] || "未定义"}`,
                correctAnswer: `${currentQ.answer}.${currentQ.options[currentQ.answer] || "未定义"}`,
            };

            setWrongQuestions((prev) => [...prev, wrongItem]);

            if (setWrongQuestionsGlobal) {
                setWrongQuestionsGlobal((prev) => [...prev, wrongItem]);
            }

            try {
                await fetch("http://localhost:1888/api/saveWrongQuestion", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(wrongItem),
                });
            } catch (err) {
                console.error("保存错题失败:", err);
            }
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setFinished(true);
        }
    };

    useEffect(() => {
        if (finished && wrongQuestions.length > 0) {
            const fetchMissingPoints = async () => {
                if (wrongQuestions.length === 0) return;
                setLoadingSummary(true);
                const wrongText = wrongQuestions
                    .map(
                        (q, idx) =>
                            `${idx + 1}. 题目: ${q.question}, 你的答案: ${q.yourAnswer}, 正确答案: ${q.correctAnswer}`
                    )
                    .join("\n");

                try {
                    const res = await fetch("http://localhost:1888/api/fetchMissingPoints", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ wrongText }),
                    });

                    const text = await res.text();
                    try {
                        const data = JSON.parse(text);
                        setSummary(data.data || []);
                    } catch (err) {
                        console.error("AI 返回非 JSON，原始内容:", text);
                    }
                } catch (err) {
                    console.error("获取缺失知识点失败:", err);
                } finally {
                    setLoadingSummary(false);
                }
            };

            fetchMissingPoints();
        }
    }, [finished, wrongQuestions]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-50">
                <div
                    className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin mb-4"
                    style={{ animationDuration: "10s" }}
                ></div>
                <div className="text-lg font-semibold">正在加载专属于你的练习题...</div>
            </div>
        );
    }

    if (!questions || questions.length === 0)
        return (
            <div>
                <p>当前项目暂无可用题目</p>
                <button onClick={goBack} className="mt-4 px-4 py-2 bg-black text-white rounded-lg">
                    返回
                </button>
            </div>
        );

    const currentQ = questions[currentIndex] || { question: "题目加载异常", options: {} };

    const percentage = Math.round((score / questions.length) * 100);


    if (finished) {
        return (
            <div className="flex h-full w-full">
                <div className="w-2/3 overflow-y-auto flex flex-col justify-start">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold">测试完成 🎉</h1>
                        {wrongQuestions.length > 0 ? (
                            <div className="space-y-3">
                                <h2 className="font-semibold mb-2">错题：</h2>
                                {wrongQuestions.map((item, index) => (
                                    <div key={index} className="p-3 border rounded bg-red-50">
                                        <p><strong>{item.question}</strong></p>
                                        <p className="text-red-500">你的答案：{item.yourAnswer}</p>
                                        <p className="text-green-600">正确答案：{item.correctAnswer}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>全部答对，恭喜！</p>
                        )}
                    </div>
                </div>

                <div className="w-1/3 bg-gray-100 flex flex-col items-center justify-start p-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-30 h-30">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gray-300 to-gray-100"></div>

                            <div className="absolute top-1/2 w-full text-center text-xl font-bold -translate-y-1/2">
                                {score} / {questions.length}
                            </div>
                        </div>
                        <p className="mt-4 text-gray-600">正确率：{percentage}%</p>
                    </div>
                    <div className="mt-5">
                        <div className="bg-white border rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-2">AI总结的缺失知识点与建议：</h2>
                            {loadingSummary ? (
                                <div className="flex justify-center items-center mt-4">
                                    <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin" style={{ animationDuration: "10s" }}></div>
                                </div>
                            ) : summary.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">
                                    {Array.isArray(summary) ? (
                                        summary.map((item, idx) => (
                                            <li key={idx}>
                                                <strong>{item.knowledgePoint}：</strong> {item.suggestion}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">{summary || "暂无建议"}</p>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-gray-500">暂无建议</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex justify-center">
            <div className="w-full max-w-3xl p-6">
                <div className="mb-4 text-gray-500">
                    第 {currentIndex + 1} / {questions.length} 题
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-6">{currentQ.question}</h2>

                    <div className="flex flex-col gap-4">
                        {currentQ.options && Object.entries(currentQ.options).length > 0 ? (
                            Object.entries(currentQ.options).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handleAnswer(key)}
                                    className="w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow active:scale-[0.98]"
                                >
                                    <span className="font-medium mr-2">{key}.</span>
                                    {value}
                                </button>
                            ))
                        ) : (
                            <p className="text-red-500">选项加载异常</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Testing;