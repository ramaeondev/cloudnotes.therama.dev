import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase_url,
      environment.supabase_anon_key
    );
  }

  /** AUTH METHODS **/
  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  /** GENERIC QUERY METHODS **/
  from(table: string) {
    return this.supabase.from(table);
  }

  rpc(fn: string, params?: Record<string, any>) {
    return this.supabase.rpc(fn, params);
  }
}
