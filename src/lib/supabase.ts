import { supabase } from "@/integrations/supabase/client";

export interface Memory {
  id: string;
  fullText: string;
  summary: string;
  category: "task" | "reminder" | "idea" | "note";
  timestamp: string;
  date: string;
  hasReminder: boolean;
  audioUrl: string;
  isFavorite: boolean;
}

export interface Reminder {
  id: string;
  memoryId: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}

// Transform database fields to frontend format
const transformMemory = (dbMemory: any): Memory => ({
  id: dbMemory.id,
  fullText: dbMemory.full_text || '',
  summary: dbMemory.summary || '',
  category: dbMemory.category || 'note',
  timestamp: dbMemory.created_at || '',
  date: dbMemory.date || '',
  hasReminder: dbMemory.reminder_needed || false,
  audioUrl: dbMemory.audio_url || '',
  isFavorite: dbMemory.is_favorite || false,
});

export const memoryApi = {
  async getMemories(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformMemory);
  },

  async getMemoryById(id: string): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformMemory(data);
  },

  async createMemory(text: string, audioUrl?: string): Promise<Memory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        full_text: text,
        summary: text.slice(0, 100),
        audio_url: audioUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return transformMemory(data);
  },

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const dbUpdates: any = {};
    if (updates.fullText !== undefined) dbUpdates.full_text = updates.fullText;
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.hasReminder !== undefined) dbUpdates.reminder_needed = updates.hasReminder;
    if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl;

    const { data, error } = await supabase
      .from('memories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMemory(data);
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchMemories(query: string, category?: string): Promise<Memory[]> {
    let queryBuilder = supabase
      .from('memories')
      .select('*');

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`full_text.ilike.%${query}%,summary.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformMemory);
  },
};

export const reminderApi = {
  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        memories (*)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      memoryId: r.memory_id,
      description: r.description,
      dueDate: r.due_date,
      isCompleted: r.is_completed,
    }));
  },
};
