import { Request, Response } from 'express';
import { transcribeAudio } from '../services/openai.service';
import fs from 'fs';

export const uploadAudio = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // In a real app, we might upload to S3 or Supabase Storage here
        // For now, we just return the local path or success message
        res.json({
            message: 'File uploaded successfully',
            filePath: req.file.path
        });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
};

export const transcribe = async (req: Request, res: Response) => {
    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const text = await transcribeAudio(filePath);

        // Clean up file after transcription if needed
        // fs.unlinkSync(filePath);

        res.json({ text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Transcription failed' });
    }
};
