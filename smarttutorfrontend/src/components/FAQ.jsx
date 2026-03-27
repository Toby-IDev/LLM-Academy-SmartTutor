import { useState } from "react";

function FAQ({ setView }) {

    const [faq, setFaq] = useState("usage");
    const [openIndexes, setOpenIndexes] = useState([]);
    const toggle = (index) => {
        if (openIndexes.includes(index)) {
            setOpenIndexes(openIndexes.filter(i => i !== index));
        } else {
            setOpenIndexes([...openIndexes, index]);
        }
    };

    return (
        <div className="flex h-screen w-full">
            <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4">
                <h2 className="text-lg font-semibold mb-4">FAQ</h2>

                <div
                    onClick={() => {
                        setFaq("firsttimeuse");
                    }}
                    className={`p-3 rounded-lg cursor-pointer ${faq === "firsttimeuse"
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "bg-gray-50 hover:bg-gray-100"
                        }`}
                >
                    第一次使用
                </div>

                <div
                    onClick={() => {
                        setFaq("filetype");
                    }}
                    className={`p-3 rounded-lg cursor-pointer ${faq === "filetype"
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "bg-gray-50 hover:bg-gray-100"
                        }`}
                >
                    文件上传格式问题
                </div>
                <div
                    onClick={() => {
                        setFaq("update");
                    }}
                    className={`p-3 rounded-lg cursor-pointer ${faq === "update"
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "bg-gray-50 hover:bg-gray-100"
                        }`}
                >
                    后续更新方向与创作激励
                </div>

            </div>

            <div className="w-2/3 bg-gray-50 overflow-y-auto p-6 space-y-4">

                {faq == "firsttimeuse" && (
                    <div className="space-y-4">
                        <div
                            onClick={() => toggle(0)}
                            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition"
                        >
                            <p className="font-semibold flex justify-between">
                                首次使用请先绑定API密钥
                                <span>{openIndexes.includes(0) ? "−" : "+"}</span>
                            </p>

                            <div
                                className={`text-gray-600 text-sm mt-2 transition-all duration-300 overflow-hidden ${openIndexes.includes(0) ? "max-h-[1000px]" : "max-h-12"}`}
                            >
                                <p>
                                    由于本应用的大部分功能由人工智能驱动，且不内置任何AI模型，
                                    用户需自行绑定API密钥，以调用第三方厂商提供的大模型服务...
                                </p>

                                {openIndexes.includes(0) && (
                                    <>
                                        <br />
                                        <ol className="list-decimal pl-5">
                                            <li>月之暗面（Kimi）</li>
                                            <li>阿里云通义千问</li>
                                            <li>深度求索（DeepSeek）</li>
                                        </ol>

                                        <br />
                                        <p>
                                            用户在首次使用该项目时，或每次重启后端后，都务必要前往Setting设置页面绑定API密钥。
                                        </p>

                                        <p className="mt-2">
                                            绑定方法：进入 Setting 页面 → 选择模型 → 输入 API Key → 保存。
                                        </p>

                                        <br />
                                        <img
                                            src="/src/assets/faq绑定API密钥.png"
                                            className="rounded border"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            onClick={() => toggle(1)}
                            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition"
                        >
                            <p className="font-semibold flex justify-between">
                                如何获取大模型服务商的API密钥
                                <span>{openIndexes.includes(1) ? "−" : "+"}</span>
                            </p>

                            <div
                                className={`text-gray-600 text-sm mt-2 transition-all duration-300 overflow-hidden ${openIndexes.includes(1) ? "max-h-[1000px]" : "max-h-12"}`}
                            >
                                <p>大模型服务商的API密钥获取方式都有差异，这里将为你提供Kimi、阿里云千问以及DeepseekAPI密钥的获取链接</p>
                                {openIndexes.includes(1) && (
                                    <>
                                        <div className="space-y-3 mt-4">

                                            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition">
                                                <div>
                                                    <p className="font-medium text-sm">Kimi（Moonshot）</p>
                                                    <p className="text-xs text-gray-500">获取 API 密钥</p>
                                                </div>
                                                <a
                                                    href="https://platform.moonshot.cn/"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                                >
                                                    前往
                                                </a>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition">
                                                <div>
                                                    <p className="font-medium text-sm">通义千问（Qwen）</p>
                                                    <p className="text-xs text-gray-500">阿里云 DashScope 平台</p>
                                                </div>
                                                <a
                                                    href="https://dashscope.aliyun.com/"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                                >
                                                    前往
                                                </a>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition">
                                                <div>
                                                    <p className="font-medium text-sm">DeepSeek</p>
                                                    <p className="text-xs text-gray-500">获取 API 密钥</p>
                                                </div>
                                                <a
                                                    href="https://platform.deepseek.com/"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                                >
                                                    前往
                                                </a>
                                            </div>

                                        </div>
                                        <br></br>
                                        <p>只需在服务商平台注册账户并创建项目，设置项目名称，即可获得API密钥用于绑定本应用</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            onClick={() => toggle(3)}
                            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition"
                        >
                            <p className="font-semibold flex justify-between">
                                有关收费和算力问题
                                <span>{openIndexes.includes(3) ? "−" : "+"}</span>
                            </p>
                            <div
                                className={`text-gray-600 text-sm mt-2 transition-all duration-300 overflow-hidden ${openIndexes.includes(3) ? "max-h-[1000px]" : "max-h-12"
                                    }`}
                            >

                                {openIndexes.includes(3) && (<><p>本应用本身不收取AI调用费用，所有功能依赖第三方大模型服务商的API Key，相关计费及使用规则请参考各服务商官方说明。推荐各位可以优先考虑通义千问和Kimi，通义千问为用户设置了免费的额度，Kimi则支持充值返赠。</p><br></br><p>有关算力问题，本应用不自带计算资源，所有计算请求均通过用户绑定的API Key发送至服务商，因此算力和响应速度取决于API Key的速率与服务商接口限制。有时可能会出现抓取不到资源导致的应用不可用问题，如果应用自身没有报错，很有可能会是模型服务商端正在进行维护和资源抢修，届时请留意模型服务商的通知</p></>)}

                            </div>
                        </div>

                    </div>)}

                {faq == "filetype" && (
                    <div
                        onClick={() => toggle(4)}
                        className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition"
                    >
                        <p className="font-semibold flex justify-between">
                            文件上传支持什么格式？
                            <span>{openIndexes.includes(4) ? "−" : "+"}</span>
                        </p>

                        <div
                            className={`text-gray-600 text-sm mt-2 transition-all duration-300 overflow-hidden ${openIndexes.includes(4) ? "max-h-[1000px]" : "max-h-12"
                                }`}
                        >
                            <p>目前仅支持 docx。在各仓库的文件上传页面目前也仅支持接受拓展名为docx的文件，希望各位海涵</p>
                        </div>
                    </div>

                )}
                {faq == "update" && (
                    <div
                        onClick={() => toggle(5)}
                        className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow transition"
                    >
                        <p className="font-semibold flex justify-between">
                            后续更新方向
                            <span>{openIndexes.includes(5) ? "−" : "+"}</span>
                        </p>

                        <div
                            className={`text-gray-600 text-sm mt-2 transition-all duration-300 overflow-hidden ${openIndexes.includes(5) ? "max-h-[1000px]" : "max-h-12"
                                }`}
                        >
                            {openIndexes.includes(5) && (
                                <><p>未来更新计划可能涉及：</p>
                                <br></br>
                                    <ol>
                                        <li>扩展在线测试题目类型</li>
                                        <li>增加算力消耗预估功能模块</li>
                                        <li>优化错题本功能</li>

                                    </ol>
                                    <br></br>
                                    <p>若项目在 GitHub 上获得足够反馈和支持，考虑将项目移植至 iOS 平台并上线。</p></>
                            )}

                        </div>
                    </div>

                )}
            </div>
        </div>
    );
}

export default FAQ;