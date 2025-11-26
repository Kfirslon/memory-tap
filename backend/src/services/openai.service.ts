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
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Analyze the user's text and extract the following fields in JSON format:
- summary: A specific, actionable summary. Avoid generic phrases like "User mentioned...". Be direct.
  - For tasks: Start with a verb (e.g., "Buy milk", "Call John").
  - For lists: "List: item1, item2, item3".
  - For thoughts: "Idea: [core concept]".
- category: One of ["task", "reminder", "idea", "note"].
  - Use "reminder" if ANY of these apply:
    * A specific time or deadline is mentioned (e.g., "tomorrow", "next week", "due date")
    * The user asks to be reminded or to remember something
    * The user mentions checking, reviewing, or doing something later
    * Action items with time context (e.g., "check Canvas for assignments")
  - Use "task" for actionable items without a specific deadline.
  - Use "idea" for creative thoughts or concepts.
  - Use "note" for general information or logs.
- date: A relevant date/time mentioned in the note (ISO 8601 format YYYY-MM-DDTHH:mm:ss), or null if none.
  - If a relative date is used (e.g. "next Monday", "tomorrow"), calculate the exact date based on the Current Date provided above.
  - If a time is not specified but a date is, default to 9:00 AM (09:00:00) for that date.
  - For vague references like "later", "soon", or "check for X", set date to tomorrow at 9:00 AM.
- reminder_needed: boolean, true if category is "reminder" or if there's any time-sensitive action.

Examples:
- "Remind me to call Mom at 5pm tomorrow" → summary: "Call Mom", category: "reminder", date: "2025-11-26T17:00:00", reminder_needed: true
- "Checking on Canvas for assignments, due date or something" → summary: "Check Canvas for assignments and due dates", category: "reminder", date: "2025-11-26T09:00:00", reminder_needed: true
- "Buy milk, eggs, and bread" → summary: "List: milk, eggs, bread", category: "task", reminder_needed: false
- "I have an idea for a new app about cats" → summary: "Idea: Cat app concept", category: "idea"

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