const express = require("express")
const cors = require("cors")
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const mammoth = require("mammoth");
const { json } = require("stream/consumers");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const app = express()

app.use(express.json()); 

// Variable "Project Name", which is used to store the name of the current project. 

const UPLOAD_DIR = path.join(__dirname, "files");

const UPLOAD_DIR2 = path.join(__dirname, "notes");

const UPLOAD_DIR3 = path.join(__dirname, "data");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

if (!fs.existsSync(UPLOAD_DIR2)) fs.mkdirSync(UPLOAD_DIR2);

if (!fs.existsSync(UPLOAD_DIR3)) fs.mkdirSync(UPLOAD_DIR3);


async function extractDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // 纯文本
}

function splitText(text, maxLength = 3000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
}

function extractContent(completion) {
    const choice = completion?.choices?.[0];

    if (!choice) return null;

    if (choice.message?.content && typeof choice.message.content === "string") {
        return choice.message.content;
    }

    if (Array.isArray(choice.message?.content)) {
        return choice.message.content.map(item => item.text).join("");
    }

    if (choice.text) {
        return choice.text;
    }

    return null;
}


let apiKey = "";
let bigmodel = "";

app.use(cors())
app.use(express.json())

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" })
})

app.listen(1888, () => {
    console.log("Server running on port 1888")
})


app.post("/api/getAPI", (req, res) => {

    const value = req.body.value;

    const model = req.body.model;

    apiKey = value;

    bigmodel = model;

});



// app.get("/api/fetchFilesAndGetAISummarize", async (req, res) => {

//     const projectName = req.query.projectName;

//     if (!projectName) {
//         return res.status(400).json({ error: "projectName required" });
//     }

//     if (!apiKey) {
//         return res.status(400).json({ error: "API key not set" });
//     }

//     const projectPath = path.join(UPLOAD_DIR, projectName);

//     if (!fs.existsSync(projectPath)) {
//         return res.status(404).json({ error: "Project not found" });
//     }

//     const client = new OpenAI({
//         apiKey: apiKey,
//         baseURL: "https://api.moonshot.cn/v1",
//     });

//     try {
//         const files = fs.readdirSync(projectPath);

//         const tasks = files.map(async (file) => {

//             const filePath = path.join(projectPath, file);

//             if (!fs.statSync(filePath).isFile()) return null;

//             try {
//                 const fileObject = await client.files.create({
//                     file: fs.createReadStream(filePath),
//                     purpose: "file-extract",
//                 });

//                 const fileContent = await (await client.files.content(fileObject.id)).text();

//                 const completion = await client.chat.completions.create({
//                     model: "kimi-k2-turbo-preview",
//                     messages: [
//                         { role: "system", content: "你是一个文档总结助手，专门服务于知识点的提炼和总结，你所接收的大部分文件都有可能是课件、提纲或复习资料" },
//                         { role: "system", content: fileContent },
//                         { role: "user", content: "请总结文件，传输的文件之间势必会有一定的联系，我需要你将其中关键点进行提炼，并对于有可能是知识点的地方进行分点总结，一个单一文件的总结不超过500字，总共的字数不超过2000字，对于知识点可以利用你的能力进行一定的补全" },
//                     ],
//                 });

//                 return {
//                     file,
//                     summary: completion.choices[0].message.content,
//                 };

//             } catch (err) {
//                 return {
//                     file,
//                     error: err.message,
//                 };
//             }
//         });

//         const results = (await Promise.all(tasks)).filter(Boolean);

//         res.json({
//             success: true,
//             data: results,
//         });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });



app.get("/api/fetchFilesAndGetAISummarize", async (req, res) => {

    const projectName = req.query.projectName;

    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }

    if (!apiKey) {
        return res.status(400).json({ error: "API key not set" });
    }

    const projectPath = path.join(UPLOAD_DIR, projectName);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: "Project not found" });
    }

    let model;
    let baseURL;

    if (bigmodel === "Kimi") {
        model = "kimi-k2-turbo-preview"
        baseURL = "https://api.moonshot.cn/v1"

    } else if (bigmodel === "Qwen") {
        model = "qwen-plus"
        baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    } else if (bigmodel === "Deepseek") {
        model = "deepseek-chat"
        baseURL = "https://api.deepseek.com"
    }


    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    try {
        const files = fs.readdirSync(projectPath);

        const tasks = files.map(async (file) => {

            const filePath = path.join(projectPath, file);

            if (!fs.statSync(filePath).isFile()) return null;

            if (!file.endsWith(".docx")) {
                return {
                    file,
                    error: "仅支持 .docx 文件",
                };
            }

            try {

                let text = await extractDocx(filePath);

                if (!text || text.trim().length < 20) {
                    return {
                        file,
                        error: "文档内容为空或解析失败",
                    };
                }


                const chunks = splitText(text);

                const partialSummaries = [];

                for (const chunk of chunks) {
                    const completion = await client.chat.completions.create({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: "你是一个文档总结助手，擅长提炼知识点"
                            },
                            {
                                role: "user",
                                content: `请总结以下内容的关键知识点：\n${chunk}`
                            }
                        ],
                    });

                    const content = extractContent(completion)
                    if (!content) {
                        return { file, error: "模型未返回有效内容" };
                    }

                    partialSummaries.push(content);
                }

                const finalCompletion = await client.chat.completions.create({
                    model: model,
                    messages: [
                        {
                            role: "system",
                            content: "你是一个知识整理专家"
                        },
                        {
                            role: "user",
                            content: `以下是多个分段总结，请整合为最终知识点总结：要求：1.分点输出 2.不超过800字 3.结构清晰 4.可以适当补充知识点

${partialSummaries.join("\n")}
                            `
                        }
                    ],
                });

                const finalContent = extractContent(finalCompletion)
                if (!finalContent) {
                    return { file, error: "整合总结失败" };
                }

                return {
                    file,
                    // summary: finalCompletion.choices[0].message.content,
                    summary: finalContent
                };

            } catch (err) {
                return {
                    file,
                    error: err.message,
                };
            }
        });

        const results = (await Promise.all(tasks)).filter(Boolean);

        res.json({
            success: true,
            data: results,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/api/getprojects", (req, res) => {

    const projects = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => {

            const projectPath = path.join(UPLOAD_DIR, dir.name)

            const fileCount = fs.readdirSync(projectPath).length

            return {
                name: dir.name,
                fileCount
            }

        })
    res.json({ projects })
})

app.get("/api/createproject", (req, res) => {

    // Variable "Project Name", which is used to store the name of the current project.
    const projectName = req.query.projectName

    if (!projectName) {
        return res.status(400).json({ error: "projectName required" })
    }
    const projectPath = path.join(UPLOAD_DIR, projectName)
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath)
        res.json({
            message: "Project created successfully",
            project: projectName
        })

    } else {

        res.status(400).json({
            error: "Project already exists"
        })

    }
})


app.get("/api/getfiles", (req, res) => {

    const projectName = req.query.projectName
    if (!projectName) {
        return res.status(400).json({
            error: "projectName required"
        })
    }
    const projectPath = path.join(UPLOAD_DIR, projectName)
    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({
            error: "Project not found"
        })
    }
    const files = fs.readdirSync(projectPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => {

            const filePath = path.join(projectPath, file.name)
            const stats = fs.statSync(filePath)

            return {
                name: file.name,
                size: stats.size
            }

        })

    res.json({ files })


})


app.get("/api/getnotes", (req, res) => {

    const projectName = req.query.projectName;

    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }

    const projectPath = path.join(UPLOAD_DIR2, projectName);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: "Project not found" });
    }

    const notes = fs.readdirSync(projectPath, { withFileTypes: true })
        .filter(file => {
            if (!file.isFile()) return false;

            const ext = path.extname(file.name).toLowerCase();
            return ext === ".docx";
        })
        .map(file => ({
            name: file.name,
            path: path.join(projectPath, file.name),
        }));

    res.json({ notes });
});


app.get("/api/downloadNotes", (req, res) => {
    const { projectName, fileName } = req.query;

    if (!projectName || !fileName) {
        return res.status(400).json({ error: "Missing params" });
    }

    const filePath = path.join(UPLOAD_DIR2, projectName, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath);
});

app.post("/api/deleteProject", (req, res) => {
    const { projectName } = req.body;
    try {
        const filePath = path.join(UPLOAD_DIR, projectName);
        const notePath = path.join(UPLOAD_DIR2, projectName);

        if (fs.existsSync(filePath)) fs.rmSync(filePath, { recursive: true, force: true });
        if (fs.existsSync(notePath)) fs.rmSync(notePath, { recursive: true, force: true });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/deleteNote", (req, res) => {
    const { projectName, fileName } = req.body;

    const filePath = path.join(__dirname, "notes", projectName, fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ success: true });
    }

    res.status(404).json({ error: "File not found" });
});



app.post("/api/deleteFiles", (req, res) => {
    const { projectName, files } = req.body;

    if (!projectName || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    const projectPath = path.join(UPLOAD_DIR, projectName);

    const results = [];

    files.forEach((fileName) => {
        const filePath = path.join(projectPath, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            results.push({ file: fileName, status: "deleted" });
        } else {
            results.push({ file: fileName, status: "not found" });
        }
    });

    res.json({
        message: "Delete operation completed",
        results,
    });
});




app.post("/api/upload/:projectName", (req, res) => {
    const fileType = req.headers["content-type"];

    if (fileType != "application/octet-stream") {
        return res.status(400).json({ error: "We don't support that file type" });
    }

    const projectName = req.params.projectName;
    const projectPath = path.join(UPLOAD_DIR, projectName);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({
            error: "Project does not exist"
        });
    }

    const fileName = decodeURIComponent(req.headers["filename"]);
    const filePath = path.join(projectPath, fileName);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
        res.json({
            message: "Upload success",
            file: fileName
        });
    });

    writeStream.on("error", (err) => {
        res.status(500).json({
            error: err.message
        });
    });

})


app.post("/api/saveSummaryDocx", async (req, res) => {

    const { projectName, content, fileName } = req.body;

    if (!projectName || !content) {
        return res.status(400).json({ error: "projectName and content required" });
    }

    const projectPath = path.join(UPLOAD_DIR2, projectName);

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    const safeFileName = (fileName || "AI_Summary").replace(/\.docx$/i, "") + ".docx";
    const filePath = path.join(projectPath, safeFileName);

    const txtPath = filePath.replace(/\.docx$/, ".txt");

    try {
        fs.writeFileSync(txtPath, content, "utf8");
    } catch (err) {
        return res.status(500).json({ error: "TXT 保存失败: " + err.message });
    }

    try {
        const paragraphs = content.split("\n").map(line =>
            new Paragraph({
                children: [
                    new TextRun({
                        text: line,
                        size: 24, // 12pt
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: paragraphs,
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        fs.writeFileSync(filePath, buffer);

        res.json({
            message: "DOCX saved successfully",
            file: safeFileName,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// app.get("/api/fetchQuestionsBasedOnSummaries", async (req, res) => {

//     const projectName = req.query.projectName;

//     console.log(projectName)

//     console.log("Received request for questions with projectName:", projectName);

//     if (!projectName) {
//         return res.status(400).json({ error: "projectName required" });
//     }

//     if (!apiKey) {
//         return res.status(400).json({ error: "API key not set" });
//     }

//     const projectPath = path.join(UPLOAD_DIR2, projectName);

//     if (!fs.existsSync(projectPath)) {
//         return res.status(404).json({ error: "Project not found" });
//     }

//     const client = new OpenAI({
//         apiKey: apiKey,
//         baseURL: "https://api.moonshot.cn/v1",
//     });

//     try {
//         const files = fs.readdirSync(projectPath);

//         const txtFiles = files.filter(file => path.extname(file).toLowerCase() === ".txt");

//         const fileContents = txtFiles
//             .map((file) => {
//                 const filePath = path.join(projectPath, file);

//                 if (!fs.statSync(filePath).isFile()) return null;

//                 try {
//                     return fs.readFileSync(filePath, "utf8");
//                 } catch {
//                     return null;
//                 }
//             })
//             .filter(Boolean);

//         if (fileContents.length === 0) {
//             return res.status(400).json({ error: "No readable files found" });
//         }

//         const allContent = fileContents.join("\n\n").slice(0, 8000);

//         const completion = await client.chat.completions.create({
//             model: "kimi-k2-turbo-preview",
//             messages: [
//                 {
//                     role: "system",
//                     content: "你是一个出题助手，专门根据学习资料生成测试题",
//                 },
//                 {
//                     role: "user",
//                     content: `请根据以下文件里面所记录的有关知识，生成 10 道单选题。要求：1. 每题包含 question, options, answer 2. options 必须是 A/B/C/D 3. answer 是正确选项（如 A）4. 返回 JSON 格式如下：[{"question": "...","options": {"A": "...","B": "...","C": "...","D": "..."},"answer": "A"}]资料如下：${allContent}`,
//                 },
//             ],
//         });

//         let questions;

//         try {
//             questions = JSON.parse(completion.choices[0].message.content);
//         } catch (err) {
//             return res.status(500).json({
//                 error: "AI 返回的不是合法 JSON",
//                 raw: completion.choices[0].message.content,
//             });
//         }

//         res.json({
//             success: true,
//             data: questions,
//         });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });



app.get("/api/fetchQuestionsBasedOnSummaries", async (req, res) => {

    const projectName = req.query.projectName;

    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }

    if (!apiKey) {
        return res.status(400).json({ error: "API key not set" });
    }

    const projectPath = path.join(UPLOAD_DIR2, projectName);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: "Project not found" });
    }

    let model;
    let baseURL;

    if (bigmodel === "Kimi") {
        model = "kimi-k2-turbo-preview"
        baseURL = "https://api.moonshot.cn/v1"

    } else if (bigmodel === "Qwen") {
        model = "qwen-plus"
        baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
    else if (bigmodel === "Deepseek") {
        model = "deepseek-chat"
        baseURL = "https://api.deepseek.com"
    }

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    function safeParseJSON(text) {
        try {
            return JSON.parse(text);
        } catch {
            const match = text.match(/```json\s*([\s\S]*?)```/);
            if (match) {
                return JSON.parse(match[1]);
            }
            throw new Error("JSON parse failed");
        }
    }

    try {
        const files = fs.readdirSync(projectPath);

        const txtFiles = files.filter(file =>
            path.extname(file).toLowerCase() === ".txt"
        );

        const fileContents = txtFiles
            .map((file) => {
                const filePath = path.join(projectPath, file);

                if (!fs.statSync(filePath).isFile()) return null;

                try {
                    return fs.readFileSync(filePath, "utf8");
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        if (fileContents.length === 0) {
            return res.status(400).json({ error: "No readable files found" });
        }

        const allContent = fileContents.join("\n\n");

        const chunks = splitText(allContent);

        const allQuestions = [];

        while (allQuestions.length < 10) {

            const randomChunk = chunks[Math.floor(Math.random() * chunks.length)];

            const completion = await client.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "你是一个严格输出 JSON 的出题助手"
                    },
                    {
                        role: "user",
                        content: `请基于以下内容生成 10 道单选题。要求：1. 必须返回 JSON 数组 2. 不要任何解释 3. 不要 markdown 格式：[{"question": "...","options": { "A": "...","B": "...","C": "...","D": "..."},"answer": "A"}]内容：${randomChunk}`
                    }
                ],
            });

            let content = extractContent(completion)

            if (!content) {
                console.error("模型未返回有效内容", completion);
                continue;
            }

            try {
                const parsed = safeParseJSON(content);

                allQuestions.push(...parsed);

            } catch (err) {
                console.error("JSON解析失败:", err.message);
            }
        }

        const finalQuestions = allQuestions.slice(0, 10);

        res.json({
            success: true,
            data: finalQuestions,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/api/fetchMissingPoints", async (req, res) => {
    const { wrongText } = req.body;

    if (!wrongText) {
        return res.status(400).json({ error: "wrongText不能为空" });
    }

    let model, baseURL;

    if (bigmodel === "Kimi") {
        model = "kimi-k2-turbo-preview";
        baseURL = "https://api.moonshot.cn/v1";
    } else if (bigmodel === "Qwen") {
        model = "qwen-plus";
        baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    } else if (bigmodel === "Deepseek") {
        model = "deepseek-chat";
        baseURL = "https://api.deepseek.com";
    }

    const client = new OpenAI({
        apiKey,
        baseURL,
    });

    try {
        const completion = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: "你是一个根据错题本总结缺乏知识点和学习建议的老师"
                },
                {
                    role: "user",
                    content: `请基于以下错题总结知识薄弱点，知识薄弱点可以分点列举，并给出概括的学习建议，不超过200字，以下是错题${wrongText}`
                }
            ]
        });

        const content = extractContent(completion);
        res.json({ success: true, data: content });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/api/saveWrongQuestion", (req, res) => {
    const { projectName, question, yourAnswer, correctAnswer } = req.body;

    if (!projectName || !question) {
        return res.status(400).json({ error: "missing params" });
    }

    const filePath = path.join(UPLOAD_DIR3, "wrongQuestions.json");

    let data = {};

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    if (!data[projectName]) {
        data[projectName] = [];
    }

    data[projectName].push({
        question,
        yourAnswer,
        correctAnswer,
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ success: true });
});


app.get("/api/getWrongQuestions", (req, res) => {

    const filePath = path.join(UPLOAD_DIR3, "wrongQuestions.json");

    if (!fs.existsSync(filePath)) {
        return res.json({ data: {} });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    res.json({ data });
});


app.delete("/api/deleteWrongQuestions", (req, res) => {
  const filePath = path.join(UPLOAD_DIR3, "wrongQuestions.json");

  if (!fs.existsSync(filePath)) {
    return res.json({ success: true, message: "文件已不存在" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "错题已全部删除" });
  } catch (err) {
    console.error("删除错题文件失败:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});