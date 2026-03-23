const express = require("express")
const cors = require("cors")
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");

const app = express()


// Variable "Project Name", which is used to store the name of the current project. 

const UPLOAD_DIR = path.join(__dirname, "files");

const UPLOAD_DIR2 = path.join(__dirname, "notes");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(UPLOAD_DIR2)) fs.mkdirSync(UPLOAD_DIR2);

let apiKey = "";

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

    apiKey = value;

    // console.log("API Key updated in backend:", apiKey);

});



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

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.moonshot.cn/v1",
    });

    try {
        const files = fs.readdirSync(projectPath);

        const tasks = files.map(async (file) => {
            const filePath = path.join(projectPath, file);

            if (!fs.statSync(filePath).isFile()) return null;

            try {
                const fileObject = await client.files.create({
                    file: fs.createReadStream(filePath),
                    purpose: "file-extract",
                });

                const fileContent = await (await client.files.content(fileObject.id)).text();

                const completion = await client.chat.completions.create({
                    model: "kimi-k2-turbo-preview",
                    messages: [
                        { role: "system", content: "你是一个文档总结助手，专门服务于知识点的提炼和总结，你所接收的大部分文件都有可能是课件、提纲或复习资料" },
                        { role: "system", content: fileContent },
                        { role: "user", content: "请总结文件，传输的文件之间势必会有一定的联系，我需要你将其中关键点进行提炼，并对于有可能是知识点的地方进行分点总结，一个单一文件的总结不超过500字，总共的字数不超过2000字，对于知识点可以利用你的能力进行一定的补全" },
                    ],
                });

                return {
                    file,
                    summary: completion.choices[0].message.content,
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


app.post("/api/saveSummaryPDF", (req, res) => {
    const { projectName, content, fileName } = req.body;

    if (!projectName || !content) {
        return res.status(400).json({ error: "projectName and content required" });
    }

    const projectPath = path.join(UPLOAD_DIR2, projectName);
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    const safeFileName = fileName || "AI_Summary.pdf";
    const filePath = path.join(projectPath, safeFileName);

     const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        const fontPath = path.join(__dirname, "fonts", "NanoFont.ttf"); 

    
        doc.font(fontPath);
        

        doc.fontSize(12).text(content, {
            lineGap: 4,
        });

        doc.end();

    writeStream.on("finish", () => {
        res.json({ message: "PDF saved successfully", file: safeFileName });
    });

    writeStream.on("error", (err) => {
        res.status(500).json({ error: err.message });
    });
});


