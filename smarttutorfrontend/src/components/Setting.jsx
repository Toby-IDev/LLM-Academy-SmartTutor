import { useState } from 'react'


function Setting({ setView }) {


    const [api, setAPI] = useState("");
    const [model, setModel] = useState("");

   const sendToBackend = async () => {
    try {
        const response = await fetch("http://localhost:1888/api/getAPI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                value: api,
                model: model
            })
        });

        if (response.ok) {
            alert("保存成功！");
        } else {
            alert("保存失败，请重试！");
        }
    } catch (error) {
        console.error(error);
        alert("请求出错，请重试！");
    }
};



    return (
        <div className="Setting">
            <div className='flex flex-col gap-10 p-4 justify-start items-center'>

                <h1 className="text-xl font-semibold text-gray-800">
                    请选择你的模型
                </h1>


                <div className='flex flex-row gap-4 p-4 justify-start items-center'>
                    <div
                        onClick={() => setModel("Kimi")}
                        className={`bg-white shadow-md rounded-2xl p-6 w-45 flex flex-col items-center gap-4 cursor-pointer transition 
        ${model === "Kimi" ? "border-2 border-black shadow-xl" : "border border-gray-200 hover:shadow-lg"}`}
                    >

                        <div className="bg-black rounded-xl w-32 h-32 flex items-center justify-center">
                            <img
                                src="/src/assets/moonshot.png"
                                alt="Moonshot"
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-md font-medium text-gray-800">
                                Moonshot Kimi
                            </h2>
                            <p className="text-sm text-gray-500">
                                月之暗面
                            </p>
                        </div>

                    </div>

                    <div
                        onClick={() => setModel("Qwen")}
                        className={`bg-white shadow-md rounded-2xl p-6 w-45 flex flex-col items-center gap-4 cursor-pointer transition 
        ${model === "Qwen" ? "border-2 border-black shadow-xl" : "border border-gray-200 hover:shadow-lg"}`}
                    >
                        <div className="rounded-xl w-32 h-32 flex items-center justify-center">
                            <img
                                src="/src/assets/qwen.avif"
                                alt="Qwen"
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-md font-medium text-gray-800">
                                Qwen
                            </h2>
                            <p className="text-sm text-gray-500">
                                阿里云千问
                            </p>
                        </div>
                    </div>
                    <div
                        onClick={() => setModel("Deepseek")}
                        className={`bg-white shadow-md rounded-2xl p-6 w-45 flex flex-col items-center gap-4 cursor-pointer transition 
        ${model === "Deepseek" ? "border-2 border-black shadow-xl" : "border border-gray-200 hover:shadow-lg"}`}
                    >
                        <div className="rounded-xl w-32 h-32 flex items-center justify-center">
                            <img
                                src="/src/assets/deepseek.png"
                                alt="Qwen"
                                className="w-16 h-16 object-contain"
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-md font-medium text-gray-800">
                                DeepSeek
                            </h2>
                            <p className="text-sm text-gray-500">
                                深度求索
                            </p>
                        </div>
                    </div>
                    <div
                        className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 w-45 flex flex-col items-center gap-4 opacity-80"
                    >
                        <div className="rounded-xl w-32 h-32 flex items-center justify-center bg-gray-100">
                            <img
                                src="/src/assets/unknown.png"
                                alt="More Models"
                                className="w-16 h-16 object-contain opacity-50"
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-md font-medium text-gray-600">
                                更多模型即将上线
                            </h2>
                            <p className="text-sm text-gray-400">
                                敬请期待 🚀
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex flex-row gap-2 items-center'>

                    <div className="relative group">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs cursor-pointer">
                            ?
                        </div>

                        <div className="absolute top-10 left-0 w-80 p-3 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-auto z-10">
                            <p>如何获取 API Key：</p>
                            <ul className="mt-1 list-disc pl-4 space-y-1">
                                <li>
                                    Kimi：官网注册后获取{" "}
                                    <a
                                        href="https://platform.moonshot.cn/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 underline hover:text-blue-300"
                                    >
                                        官方APIKey获取链接
                                    </a>
                                </li>
                                <li>
                                    Qwen：阿里云百炼工作台{" "}
                                    <a
                                        href="https://bailian.console.aliyun.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 underline hover:text-blue-300"
                                    >
                                        工作台链接
                                    </a>
                                </li>
                                <li>
                                    DeepSeek：DeepSeek个人开发平台{" "}
                                    <a
                                        href="https://platform.deepseek.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 underline hover:text-blue-300"
                                    >
                                        平台链接
                                    </a>
                                </li>
                            </ul>

                            <br />
                            <p>注意！部分 API Key 可能需要付费，请妥善保管</p>
                        </div>
                    </div>

                    <h1 className='text-sm font-semibold'>API密钥:</h1>

                    <input
                        type="text"
                        placeholder="请输入您的API密钥"
                        name="apiKey"
                        onChange={(e) => setAPI(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <button
                        className="px-4 py-2 text-white text-sm font-semibold bg-black rounded-xl hover:bg-gray-800 transition"
                        onClick={sendToBackend}
                    >
                        保存
                    </button>

                    <button
                        className="px-4 py-2 text-white text-sm font-semibold bg-black rounded-xl hover:bg-gray-800 transition"
                        onClick={() => setView("home")}
                    >
                        返回上一页
                    </button>

                </div>


            </div>

        </div>
    )
}

export default Setting