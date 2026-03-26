import { useEffect, useState } from "react";

function Testing({ projectName, goBack }) {

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [finished, setFinished] = useState(false);

    useEffect(() => {

        const fetchQuestions = async () => {

            setQuestions([]);

            const res = await fetch(
                `http://localhost:1888/api/fetchQuestionsBasedOnSummaries?projectName=${encodeURIComponent(projectName)}`
            );

            const data = await res.json();

            setQuestions(data.data || []);
            setLoading(false);
        };

        if (projectName) {
            fetchQuestions();
        }
    }, [projectName]);

    const handleAnswer = (selectedKey) => {

        const currentQ = questions[currentIndex];

        if (selectedKey === currentQ.answer) {
            setScore(prev => prev + 1);
        } else {
            setWrongQuestions(prev => [
                ...prev,
                {
                    question: currentQ.question,
                    yourAnswer: `${selectedKey} ${currentQ.options[selectedKey]}`, 
                    correctAnswer: `${currentQ.answer} ${currentQ.options[currentQ.answer]}`
                }
            ]);
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setFinished(true);
        }
    };

    if (loading) {
        return <div>正在加载专属于你的练习题...</div>;
    }

    if (finished) {
        return (
            <div className="w-full flex">
                <div className="w-2/3 flex justify-start items-center">
                    <div className=" w-full max-w-2xl">

                        <h1 className="text-2xl font-bold mb-4">测试完成 🎉</h1>

                        <p className="mb-4">
                            得分：{score} / {questions.length}
                        </p>

                        {wrongQuestions.length > 0 && (
                            <div>
                                <h2 className="font-semibold mb-2">错题：</h2>

                                {wrongQuestions.map((item, index) => (
                                    <div key={index} className="mb-3 p-3 border rounded bg-red-50">
                                        <p><strong>{item.question}</strong></p>
                                        <p className="text-red-500">你的答案：{item.yourAnswer} </p>
                                        <p className="text-green-600">正确答案：{item.correctAnswer}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                <div className="w-1/3 bg-gray-100 flex items-center justify-between">
                    <div className="text-gray-400">
                    </div>
                </div>

            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="w-full h-full flex justify-center">

            <div className="w-full max-w-3xl p-6">

                <div className="mb-4 text-gray-500">
                    第 {currentIndex + 1} / {questions.length} 题
                </div>

                <div className="bg-white p-6 rounded-xl shadow">

                    <h2 className="text-lg font-semibold mb-6">
                        {currentQ.question}
                    </h2>

                    <div className="flex flex-col gap-4">
                        {Object.entries(currentQ.options).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleAnswer(key)}
                                className="
                                w-full text-left px-4 py-3 rounded-lg border
                                transition-all duration-200
                                hover:bg-blue-50 hover:border-blue-400 hover:shadow
                                active:scale-[0.98]
                            "
                            >
                                <span className="font-medium mr-2">{key}.</span>
                                {value}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Testing;