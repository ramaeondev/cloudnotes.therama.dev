import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User, AuthResponse } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;
  private readonly _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(private readonly router: Router) {
    // Configure Supabase client to work with the Cloudflare proxy worker
    this.supabase = createClient(
      environment.supabase_url,
      environment.supabase_anon_key,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        global: {
          headers: {
            'apikey': environment.supabase_anon_key,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.supabase_anon_key}`
          }
        }
      }
    );
    
    // Initialize user on service start
    this.loadUser();
    
    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this._currentUser.next(session.user);
      } else if (event === 'SIGNED_OUT') {
        this._currentUser.next(null);
        this.router.navigate(['/signin']);
      }
    });
  }
  
  private async loadUser() {
    const { data } = await this.supabase.auth.getUser();
    this._currentUser.next(data.user);
  }

  /** AUTH METHODS **/
  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResponse> {
    try {
      const response = await this.supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
          data: metadata || {}
        }
      });
      
      if (response.error) {
        console.error('Signup error:', response.error);
      } else if (response.data?.user) {
        console.log('Signup successful, confirmation email sent');
      }
      
      return response;
    } catch (error) {
      console.error('Unexpected signup error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.supabase.auth.signInWithPassword({ email, password });
      
      if (response.error) {
        console.error('Login error:', response.error);
      } else if (response.data?.user) {
        console.log('Login successful');
        this._currentUser.next(response.data.user);
        this.router.navigate(['/dashboard']);
      }
      
      return response;
    } catch (error) {
      console.error('Unexpected login error:', error);
      throw error;
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (!error) {
        this._currentUser.next(null);
        this.router.navigate(['/signin']);
      }
      return { error };
    } catch (error) {
      console.error('Unexpected logout error:', error);
      return { error: error as Error };
    }
  }

  async getUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
  
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as Error };
    }
  }
  
  async updatePassword(password: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as Error };
    }
  }
  
  async verifyOtp(token: string, email: string): Promise<AuthResponse> {
    return this.supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
      email
    });
  }

  /** GENERIC QUERY METHODS **/
  from(table: string) {
    return this.supabase.from(table);
  }

  rpc(fn: string, params?: Record<string, any>) {
    return this.supabase.rpc(fn, params);
  }

  async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.updateUser({ data: metadata });
      return { error };
    } catch (error) {
      console.error('Update user metadata error:', error);
      return { error };
    }
  }

  async updateUserEmail(newEmail: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.updateUser({ email: newEmail });
      return { error };
    } catch (error) {
      console.error('Update user email error:', error);
      return { error: error as Error };
    }
  }
}
