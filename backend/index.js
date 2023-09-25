const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const AdmZip = require("adm-zip");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect(
	"mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.6/cluster0",
	{ useNewUrlParser: true, useUnifiedTopology: true }
);
const conn = mongoose.connection;

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileSchema = new mongoose.Schema({
	filename: String,
	contentType: String,
	data: Buffer,
	date: { type: Date, default: Date.now },
});

const FileModel = mongoose.model("File", fileSchema);

app.post("/upload", upload.single("file"), async (req, res) => {
	try {
		const uploadedMimetype = req.file.mimetype;

		if (
			uploadedMimetype === "application/zip" ||
			uploadedMimetype === "application/x-zip-compressed"
		) {
			const zip = new AdmZip(req.file.buffer);
			const zipEntries = zip.getEntries();
			const extractedDocuments = [];

			for (const entry of zipEntries) {
				if (!entry.isDirectory) {
					const newFile = new FileModel({
						filename: entry.entryName,
						contentType: "application/octet-stream",
						data: entry.getData(),
					});

					await newFile.save();

					extractedDocuments.push({
						name: entry.entryName,
						date: newFile.date,
					});
				}
			}

			console.log("ZIP file extracted successfully");
			res.status(200).json({
				extractedDocuments,
				message: "ZIP file extracted successfully",
			});
		} else {
			const newFile = new FileModel({
				filename: req.file.originalname,
				contentType: req.file.mimetype,
				data: req.file.buffer,
			});

			await newFile.save();

			console.log("File uploaded successfully");
			res.status(200).json({
				name: req.file.originalname,
				date: newFile.date,
				message: "File uploaded successfully",
			});
		}
	} catch (error) {
		console.error("Error during file upload:", error);

		if (
			uploadedMimetype === "application/zip" ||
			uploadedMimetype === "application/x-zip-compressed"
		) {
			console.error("Error extracting ZIP file:", error);
			res.status(500).json({ message: "ZIP file extraction failed" });
		} else {
			res.status(500).json({ message: "File upload failed" });
		}
	}
});

app.get("/documents", async (req, res) => {
	try {
		const documents = await FileModel.find();
		res.status(200).json(documents);
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).json({ message: "Error fetching documents" });
	}
});

app.delete("/delete/:id", async (req, res) => {
	const documentId = req.params.id;

	try {
		await FileModel.findByIdAndDelete(documentId);
		res.status(200).json({ message: "Document deleted successfully" });
	} catch (error) {
		console.error("Error deleting document:", error);
		res.status(500).json({ message: "Error deleting document" });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
