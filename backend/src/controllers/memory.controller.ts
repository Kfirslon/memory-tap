import { Request, Response } from 'express';
import { generateMemory } from '../services/openai.service';
import { supabase } from '../services/supabase.service';

export const createMemory = async (req: Request, res: Response) => {
    try {
        const { text, audioUrl } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log('📝 Creating memory with text:', text);
        console.log('🎵 Audio URL:', audioUrl);

        // Generate structured data from text
        const structuredData = await generateMemory(text);

        // FIX: Convert Windows backslashes to forward slashes for URLs
        const normalizedAudioUrl = audioUrl ? audioUrl.replace(/\\/g, '/') : null;

        // Save to Supabase
        // Ensure reminder flag is set if a date is provided
        if (structuredData.date && !structuredData.reminder_needed) {
            structuredData.reminder_needed = true;
        }
        const { data, error } = await supabase
            .from('memories')
            .insert([
                {
                    full_text: text,
                    summary: structuredData.summary,
                    category: structuredData.category,
                    date: structuredData.date ? new Date(structuredData.date) : null,
                    reminder_needed: structuredData.reminder_needed,
                    audio_url: normalizedAudioUrl, // ← Use normalized path
                    user_id: null,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // If this memory should have a reminder, create it
        if (structuredData.reminder_needed && structuredData.date) {
            const { error: reminderError } = await supabase
                .from('reminders')
                .insert([
                    {
                        memory_id: data.id,
                        description: structuredData.summary,
                        due_date: structuredData.date,
                        is_completed: false,
                    },
                ]);

            if (reminderError) {
                console.error('⚠️ Reminder creation failed:', reminderError);
            }
        }

        console.log('✅ Memory created:', data.id);
        res.json(data);
    } catch (error) {
        console.error('❌ Error creating memory:', error);
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
        console.error('Error fetching memories:', error);
        res.status(500).json({ error: 'Failed to fetch memories' });
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

export const deleteMemory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('memories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete memory' });
    }
};

export const searchMemories = async (req: Request, res: Response) => {
    try {
        const { query, category } = req.body;

        let dbQuery = supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false });

        if (query) {
            dbQuery = dbQuery.or(`full_text.ilike.%${query}%,summary.ilike.%${query}%`);
        }

        if (category && category !== 'all') {
            dbQuery = dbQuery.eq('category', category);
        }

        const { data, error } = await dbQuery;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};

export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_favorite } = req.body;

        const { data, error } = await supabase
            .from('memories')
            .update({ is_favorite })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
};