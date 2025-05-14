import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the uploads directory path
const uploadsDir = path.join(__dirname, "../uploads");

const videoRoute = express.Router();

// Debug middleware to log video requests
videoRoute.use((req, res, next) => {
  console.log(`[DEBUG] Video request received: ${req.url}`);
  next();
});

// Route to get video by filename
videoRoute.get("/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  console.log(`[DEBUG] Attempting to serve video at path: ${filePath}`);
  
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    console.log(`[DEBUG] Video file found: ${filename}`);
    
    // Get file size
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Handle range requests (streaming)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      
      console.log(`[DEBUG] Streaming video with range: ${start}-${end}/${fileSize}`);
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Handle non-range requests
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      
      console.log(`[DEBUG] Serving full video file: ${filename}, size: ${fileSize}`);
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    console.log(`[DEBUG] Video file not found: ${filename} at path ${filePath}`);
    res.status(404).json({ message: "Video not found" });
  }
});

export default videoRoute;
