import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The cabinet is optional infrastructure — the rest of the site (hero,
// story, test) must keep working even if Supabase was never configured.
// `supabase` is null in that case; callers check `isCabinetEnabled` first.
export const isCabinetEnabled = Boolean(url && anonKey);

export const supabase = isCabinetEnabled ? createClient(url, anonKey) : null;
