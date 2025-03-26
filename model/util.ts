import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "jsr:@openai/openai";


export const sql = postgres(
    // `SUPABASE_DB_URL` is a built-in environment variable
    Deno.env.get("SUPABASE_DB_URL")!,
  );

  export function getSupabaseClient() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  export function getOpenAIClient() {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY must be set");
    }
    return new OpenAI({ apiKey: openaiApiKey });
  }
