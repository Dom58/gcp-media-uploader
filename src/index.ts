import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import { generateRandomNumberString, sanitizeFileName } from './helpers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// Create a Google Cloud Storage client
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME as string; // Ensure it is a string

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const folder = "logos";

        if (!file) {
            return res.status(400).send("No file uploaded.");
        }

        const sanitizedFileName = sanitizeFileName(file.originalname);
        const uniqueFileName = `${generateRandomNumberString()}_${sanitizedFileName}`;

        const blob = storage.bucket(bucketName).file(`${folder}/${uniqueFileName}`); // Specify folder in the file path
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            console.error("Upload error:", err);
            res.status(500).send("Something went wrong!");
        });

        blobStream.on('finish', async () => {
            const fileUrl = `https://storage.googleapis.com/${bucketName}/${folder}/${uniqueFileName}`;
            console.log(`File uploaded successfully: ${uniqueFileName}`);
            console.log(`File URL: ${fileUrl}`);
            res.status(200).send(`File ${uniqueFileName} uploaded successfully. URL: ${fileUrl}`);
        });

        // Start streaming the file to Google Cloud Storage
        blobStream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading file.");
    }
});

// Endpoint to upload multiple files
app.post('/upload/multiple', upload.array('files'), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        const folder = "logos";

        console.log(`Received ${files.length} files for upload.`);

        if (!files.length) {
            return res.status(400).send("No files uploaded!");
        }

        const fileUrls: string[] = [];

        await Promise.all(files.map(async (file) => {
            const sanitizedFileName = sanitizeFileName(file.originalname);
            const uniqueFileName = `${generateRandomNumberString()}_${sanitizedFileName}`;

            const blob = storage.bucket(bucketName).file(`${folder}/${uniqueFileName}`);
            const blobStream = blob.createWriteStream({ resumable: false });

            return new Promise((resolve, reject) => {
                blobStream.on('error', (err) => {
                    console.error("Upload error:", err);
                    reject(err);
                });

                blobStream.on('finish', () => {
                    const fileUrl = `https://storage.googleapis.com/${bucketName}/${folder}/${uniqueFileName}`;
                    console.log(`File uploaded successfully: ${uniqueFileName}`);
                    fileUrls.push(fileUrl);
                    resolve(fileUrl);
                });

                blobStream.end(file.buffer);
            });
        }));

        // Send response with all uploaded file URLs
        res.status(200).send(`Files uploaded successfully. URLs: ${fileUrls.join(', ')}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading files.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
