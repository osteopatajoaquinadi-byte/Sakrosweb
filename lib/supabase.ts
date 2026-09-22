import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Inicialización lazy: evita romper el build cuando las env vars no existen
// (ej. en CI, en Preview sin variables configuradas, o en este sandbox).
// El cliente se crea solo cuando se llama por primera vez.

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son obligatorias."
    );
  }
  _supabase = createClient(url, anonKey);
  return _supabase;
}

let _serviceClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias."
    );
  }
  _serviceClient = createClient(url, serviceKey);
  return _serviceClient;
}
