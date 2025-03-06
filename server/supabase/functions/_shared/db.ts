import { createClient } from 'jsr:@supabase/supabase-js@2'

function getSupabaseClient() {
    return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
}

export const supa = getSupabaseClient();