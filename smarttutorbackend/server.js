const express = require("express")
const cors = require("cors")
const fs = require("fs");
const path = require("path");

const app = express()


// Variable "Project Name", which is used to store the name of the current project. 

const UPLOAD_DIR = path.join(__dirname, "files");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);


app.use(cors())
app.use(express.json())

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" })
})

app.listen(1888, () => {
    console.log("Server running on port 1888")
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

app.post("/api/upload/:projectName", (req, res) => {
    const fileType = req.headers["content-type"];

    if (fileType != "multipart/form-data") {
        return res.status(400).json({ error: "We don't support that file type" });
    }

    const projectName = req.params.projectName;
    const projectPath = path.join(UPLOAD_DIR, projectName);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({
            error: "Project does not exist"
        });
    }

    const fileName = req.headers["file-name"];
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