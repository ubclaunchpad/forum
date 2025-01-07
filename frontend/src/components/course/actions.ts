import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export function signOut() {
  const supabase = createClient();
  supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/signin");
}
