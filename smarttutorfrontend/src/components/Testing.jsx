import { useState } from 'react'


function Testing(projectName, setView) {

    const getQuestions = async () => {

        console.log("Fetching questions for project:", projectName.projectName);

        const res = await fetch(
            `http://localhost:1888/api/fetchQuestionsBasedOnSummaries?projectName=${encodeURIComponent(projectName.projectName)}`
        );

        const data = await res.json();

        console.log("Questions:", data);
    }


    return (
        <div className="Testing">
            <h1>这是测试页面</h1>
            <button onClick={getQuestions} className="px-4 py-2 text-white text-sm border border-gray-300 bg-black rounded-xl hover:bg-gray-800 transition">获取问题</button>
        </div>
    )
}

export default Testing