const API_URL = 'http://localhost:3000/api';

export const api = {
    uploadAudio: async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const response = await fetch(`${API_URL}/upload_audio`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    },

    transcribe: async (filePath: string) => {
        const response = await fetch(`${API_URL}/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath }),
        });

        if (!response.ok) throw new Error('Transcription failed');
        return response.json();
    },

    createMemory: async (text: string, audioUrl?: string) => {
        const response = await fetch(`${API_URL}/create_memory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, audioUrl }),
        });

        if (!response.ok) throw new Error('Failed to create memory');
        return response.json();
    },

    getMemories: async () => {
        const response = await fetch(`${API_URL}/memories`);
        if (!response.ok) throw new Error('Failed to fetch memories');
        return response.json();
    },

    getMemoryById: async (id: string) => {
        const response = await fetch(`${API_URL}/memories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch memory');
        return response.json();
    },

    searchMemories: async (query: string) => {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    getReminders: async () => {
        const response = await fetch(`${API_URL}/reminders`);
        if (!response.ok) throw new Error('Failed to fetch reminders');
        return response.json();
    },

    updateMemory: async (id: string, memory: any) => {
        const response = await fetch(`${API_URL}/memories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memory),
        });

        if (!response.ok) throw new Error('Failed to update memory');
        return response.json();
    }
};
