
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) process.env[key.trim()] = value.trim();
        });
    } catch (e) {}
}
loadEnv();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reload() {
    console.log('Notifying pgrst to reload schema...');
    const { error } = await supabase.rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload schema';" });
    if (error) console.error('Error reloading:', error);
    else console.log('Reload signal sent.');
}

reload();
