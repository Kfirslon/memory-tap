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
            .select('*, memories(summary)')
            .order('due_date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};
