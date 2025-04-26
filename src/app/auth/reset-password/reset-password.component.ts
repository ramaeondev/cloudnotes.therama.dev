import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: false
})
export class ResetPasswordComponent {
  password = '';
  error: string | null = null;
  message: string | null = null;
  loading = false;
  token: string = '';
  refreshToken: string = '';
  
  constructor(private supabase: SupabaseService) {}

  async resetPassword(accessToken: string, refreshToken: string) {
    if (!this.password) {
      this.error = 'Please enter a new password';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.message = null;
    
    try {
      // Set the session using the provided access and refresh tokens
      const { error: sessionError } = await this.supabase.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        this.loading = false;
        this.error = sessionError.message;
        return;
      }
      
      // Now update the password using our enhanced service method
      const { error } = await this.supabase.updatePassword(this.password);
      this.loading = false;
      
      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Password updated successfully! You can now sign in with your new password.';
      }
    } catch (err: any) {
      this.loading = false;
      this.error = err.message || 'An unexpected error occurred';
    }
  }
}
