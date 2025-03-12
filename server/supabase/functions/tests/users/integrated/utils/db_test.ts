import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { getSupabaseClient } from "../../../../_shared/db.ts";
import { assertThrows } from "jsr:@std/assert/throws";

describe("Supabase DB Utils", () => {
  let supabaseUrl: string;
  let supabaseServiceRoleKey: string;

  beforeEach(() => {
    supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  });

  afterEach( () => {
    Deno.env.set("SUPABASE_URL", supabaseUrl);
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceRoleKey);
  });

  it("should throw if supabase url or service role key is not set", () => {
    Deno.env.set("SUPABASE_URL", "");
    assertThrows(() => getSupabaseClient(), Error);
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "");
    assertThrows(() => getSupabaseClient(), Error);
  });
});
