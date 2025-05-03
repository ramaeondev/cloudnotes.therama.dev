import { Injectable } from '@angular/core';
// Import your Supabase client instance
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase_url, environment.supabase_anon_key);
  }

  /**
   * Gets the current user's access token.
   * 1. Try localStorage ("auth_token").
   * 2. If not found, try Supabase session.
   */
  async getToken(): Promise<string | null> {
    // Try localStorage first
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;

    // Try Supabase session
    const { data } = await this.supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
    return null;
  }
}
