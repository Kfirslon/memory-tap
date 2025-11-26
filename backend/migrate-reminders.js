require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function migrateReminders() {
    console.log('🔍 Looking for memories with reminders...');

    // Find all memories that have reminder_needed = true and a date
    const { data: memories, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .eq('reminder_needed', true)
        .not('date', 'is', null);

    if (fetchError) {
        console.error('❌ Error fetching memories:', fetchError);
        return;
    }

    console.log(`📋 Found ${memories?.length || 0} memories with reminders`);

    let created = 0;
    let skipped = 0;

    for (const memory of memories || []) {
        // Check if reminder already exists
        const { data: existing } = await supabase
            .from('reminders')
            .select('id')
            .eq('memory_id', memory.id)
            .single();

        if (existing) {
            console.log(`⏭️  Skipping ${memory.id} - reminder already exists`);
            skipped++;
            continue;
        }

        // Create reminder
        const { error: insertError } = await supabase
            .from('reminders')
            .insert({
                memory_id: memory.id,
                description: memory.summary,
                due_date: memory.date,
                is_completed: false,
            });

        if (insertError) {
            console.error(`❌ Failed to create reminder for ${memory.id}:`, insertError);
        } else {
            console.log(`✅ Created reminder for: ${memory.summary}`);
            created++;
        }
    }

    console.log('\n📊 Migration complete!');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${memories?.length || 0}`);
}

migrateReminders().catch(console.error);
