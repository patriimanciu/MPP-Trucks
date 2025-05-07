import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const fileTypes = /mp4|mov|avi|mkv/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  },
});

router.post('/upload', upload.single('video'), (req, res) => {
  try {
    console.log('File received:', req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    const filePath = `/uploads/videos/${req.file.filename}`;
    console.log('File path:', filePath); // Debug log
    res.status(200).json({ message: 'Video uploaded successfully', filePath });
  } catch (error) {
    console.error('Error in /upload route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

export default router;