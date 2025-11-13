import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carouselRouter = express.Router();

const carouselDir = path.join(__dirname, "../public/carousel");
if (!fs.existsSync(carouselDir)) {
  fs.mkdirSync(carouselDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carouselDir);
  },
  filename: (req, file, cb) => {
    const { imagenId, isMobile } = req.body;
    const ext = path.extname(file.originalname);
    const prefix = isMobile === "true" ? "mobile" : "desktop";
    cb(null, `${imagenId}-${prefix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo archivos de imagen"));
    }
    cb(null, true);
  },
});

carouselRouter.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Hay que subir una imagen" });
    }

    const { filename } = req.file;
    res.status(200).json({
      mensaje: "Imagen subida correctamente",
      file: filename,
      url: `/carousel/${filename}`,
    });
  } catch (error) {
    console.error("Error al subir la imagen: ", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default carouselRouter;
