import { createClient } from "@supabase/supabase-js";

// Cliente de administrador con service_role_key (⚠️ nunca exponer al cliente)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
