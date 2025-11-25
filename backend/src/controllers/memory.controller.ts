import { Request, Response } from 'express';
import { generateMemory } from '../services/openai.service';
import { supabase } from '../services/supabase.service';

export const createMemory = async (req: Request, res: Response) => {
    try {
        const { text, audioUrl } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Generate structured data from text
        const structuredData = await generateMemory(text);

        // Save to Supabase
        const { data, error } = await supabase
            .from('memories')
            .insert([
                {
                    full_text: text,
                    summary: structuredData.summary,
                    category: structuredData.category,
                    date: structuredData.date ? new Date(structuredData.date) : null,
                    reminder_needed: structuredData.reminder_needed,
                    audio_url: audioUrl,
                    user_id: '00000000-0000-0000-0000-000000000000' // Placeholder user ID
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create memory' });
    }
};

export const getMemories = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch memories' });
    }
};

export const searchMemories = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        // Simple text search for now
        const { data, error } = await supabase
            .from('memories')
            .select('*')
            .ilike('full_text', `%${query}%`);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};

export const getMemoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('memories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Memory not found' });
    }
};

export const updateMemory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('memories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update memory' });
    }
};
