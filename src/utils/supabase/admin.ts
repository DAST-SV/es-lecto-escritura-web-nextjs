import { createClient } from "@supabase/supabase-js";

// console.log("Supabase Admin URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log("Supabase Service Role Key:", process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
// Cliente de administrador con service_role_key (⚠️ nunca exponer al cliente)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
