const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
const PORT = 5000;

// Create upload folder if not exist
const uploadFolder = "./uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Store uploaded file locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log("📁 File saved locally at:", filePath);

    // Upload to IPFS
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const ipfsResponse = await axios.post("http://127.0.0.1:5001/api/v0/add", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const cid = ipfsResponse.data.Hash;
    console.log("📤 File uploaded to IPFS:", ipfsResponse.data);

    // ✅ Pin the file
    await axios.post(`http://127.0.0.1:5001/api/v0/pin/add?arg=${cid}`);
    console.log("📌 CID pinned successfully:", cid);

    res.json({ cid });
  } catch (err) {
    console.error("❌ Error uploading/pinning file:", err.message);
    res.status(500).send("Upload failed");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
