import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const provider = process.env.AI_PROVIDER || 'groq';
const apiKey = provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
const baseURL = provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined;

if (!apiKey) {
    throw new Error(`API key for ${provider} is not set`);
}

export const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

// FIX 1: Force English transcription
export const transcribeAudio = async (filePath: string): Promise<string> => {
    try {
        const model = provider === 'groq' ? 'whisper-large-v3' : 'whisper-1';
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: model,
            language: 'en', // ← FORCE ENGLISH
            prompt: 'This is a voice note in English.', // ← Help Whisper understand it's English
        });
        return transcription.text;
    } catch (error) {
        console.error('❌ Error transcribing audio:', error);
        throw error;
    }
};

// FIX 2: Better error handling and logging
export const generateMemory = async (text: string) => {
    try {
        console.log('🤖 Generating memory for text:', text);

        const model = provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o';
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that organizes voice notes into structured memories.
Analyze the user's text and extract the following fields in JSON format:
- summary: A short summary of the note (max 1 sentence).
- category: One of ["task", "reminder", "idea", "note"].
- date: A relevant date mentioned in the note (YYYY-MM-DD), or null if none.
- reminder_needed: boolean, true if the user asks to be reminded or it's a task with a deadline.

Return ONLY the JSON object. Do not include markdown formatting like \`\`\`json.
`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            model: model,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content from AI provider");

        const parsed = JSON.parse(content);
        console.log('✅ AI generated:', JSON.stringify(parsed, null, 2));

        return parsed;
    } catch (error) {
        console.error('❌ Error generating memory:', error);

        // FIX 3: Fallback to basic structure if AI fails
        console.log('⚠️ Using fallback memory structure');
        return {
            summary: text.substring(0, 100) + '...',
            category: 'note',
            date: null,
            reminder_needed: false
        };
    }
};