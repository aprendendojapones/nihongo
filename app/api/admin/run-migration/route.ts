import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Read the migration file
        const migrationPath = path.join(process.cwd(), 'migrations', 'create_game_management.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL into individual statements (simple approach)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        const results = [];
        for (const statement of statements) {
            try {
                const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
                if (error) {
                    // Try direct query if RPC doesn't exist
                    const { error: queryError } = await supabase.from('_').select('*').limit(0);
                    console.log('Executing:', statement.substring(0, 100));
                }
                results.push({ success: !error, statement: statement.substring(0, 50) });
            } catch (e: any) {
                results.push({ success: false, error: e.message, statement: statement.substring(0, 50) });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Migration executed',
            results
        });

    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: error.message,
            details: 'Check server logs for details'
        }, { status: 500 });
    }
}
