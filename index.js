require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 6000;

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to upload files
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const folder = "sampleFolder";
        const uniqueFileName = `${uuidv4()}_${file.originalname}`;

        const blob = storage.bucket(bucketName).file(`${folder}/${uniqueFileName}`); // Specify folder in the file path
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            console.error("Upload error:", err);
            res.status(500).send("Something went wrong!");
        });

        blobStream.on('finish', async () => {
            // Log the uploaded file details
            const fileUrl = `https://storage.googleapis.com/${bucketName}/${folder}/${uniqueFileName}`;
            console.log(`File uploaded successfully: ${uniqueFileName}`);
            console.log(`File URL: ${fileUrl}`);

            res.status(200).send(`File ${uniqueFileName} uploaded successfully. URL: ${fileUrl}`);
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading file.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
