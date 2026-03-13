import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";


const { getApiKey } = require("./apiKeyStore");


let API = apiKey; 


app.post("/api/uploadToAI/:projectName/:fileName", async (req, res) => {
    KIMI_API_KEY = getApiKey(); 
});


app.post("/api/uploadToAI/:projectName/:fileName", async (req, res) => {
  const { projectName, fileName } = req.params;

  const projectPath = path.join(UPLOAD_DIR, projectName);
  const filePath = path.join(projectPath, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("purpose", "file-extract"); 


    const response = await fetch("https://api.moonshot.cn/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API}`,
      },
      body: form,
    });

    const data = await response.json();

    console.log("Uploaded to Kimi:", data);

    res.json({
      message: "File uploaded to AI successfully",
      file_id: data.id, 
    });
  } catch (err) {
    console.error("Kimi upload error:", err);
    res.status(500).json({ error: "Upload to AI failed" });
  }
});

app.get("/api/test2", (req, res) => {
    res.json({ message: "Another Backend is working!" })
})


