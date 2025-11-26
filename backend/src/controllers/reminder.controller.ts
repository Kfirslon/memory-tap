import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

export const createReminder = async (req: Request, res: Response) => {
    try {
        const { memory_id, description, due_date } = req.body;

        const { data, error } = await supabase
            .from('reminders')
            .insert([
                {
                    memory_id,
                    description,
                    due_date,
                    is_completed: false
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create reminder' });
    }
};

export const getReminders = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('reminders')
            .select(`
                *,
                memories (
                    id,
                    summary,
                    full_text,
                    category,
                    created_at,
                    audio_url,
                    is_favorite
                )
            `)
            .eq('is_completed', false)
            .order('due_date', { ascending: true });

        if (error) throw error;

        // Transform reminder data to match memory card structure
        const transformed = data.map((reminder: any) => ({
            id: reminder.memories?.id || reminder.id,
            summary: reminder.memories?.summary || reminder.description,
            category: 'reminder',
            timestamp: reminder.due_date,
            hasReminder: true,
            fullText: reminder.memories?.full_text || '',
            audioUrl: reminder.memories?.audio_url || '',
            isFavorite: reminder.memories?.is_favorite || false,
            due_date: reminder.due_date,
        }));

        res.json(transformed);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};
