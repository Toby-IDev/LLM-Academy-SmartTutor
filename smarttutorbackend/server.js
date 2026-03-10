const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" })
})

app.listen(1888, () => {
  console.log("Server running on port 1888")
})