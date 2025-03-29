import "jsr:@std/dotenv/load";

import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { createClient } from 'jsr:@supabase/supabase-js@2'

export function getSupabaseClient() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export const supa = getSupabaseClient();


export function sqlClient() {
    return postgres(Deno.env.get('SUPABASE_DB_URL')!);
}

