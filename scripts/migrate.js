
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e) {
        console.log('Could not read .env.local from parent dir, checking current dir...');
        try {
            const envPath = path.join(__dirname, '.env.local');
            const envFile = fs.readFileSync(envPath, 'utf8');
            envFile.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        } catch (e2) {
            console.error('Could not load .env.local', e2.message);
        }
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.error('Please specify a migration file path (relative to migrations/ folder)');
        process.exit(1);
    }

    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    console.log(`Reading migration: ${migrationPath}`);

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Remove comments (lines starting with --)
        const cleanSql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');

        const statements = cleanSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements.`);

        for (const statement of statements) {
            // Using a hidden RPC 'exec_sql' if available, otherwise this only works if Supabase JS client allows raw SQL (it doesn't usually).
            // We'll try to rely on the 'rpc' method assuming 'exec_sql' exists (common in these projects setup).
            // If exec_sql doesn't exist, this script will fail and we must manually use the SQL Editor in Supabase.
            // Let's assume the user has set up exec_sql or similar.
            
            // Check if we can use a simpler method if RPC fails or fallsback.
            // Actually, without an RPC or direct connection string (pg library), we can't run raw SQL via supabase-js.
            // But wait! The previous code in `app/api/admin/run-migration/route.ts` used `supabase.rpc('exec_sql')`.
            // So we assume that RPC exists.
            
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (error) {
                console.error('Error executing statement:', error.message);
                console.error('Statement:', statement.substring(0, 50) + '...');
            } else {
                console.log('Success.');
            }
        }
    } catch (e) {
        console.error('Error reading/executing migration:', e.message);
    }
}

runMigration();
