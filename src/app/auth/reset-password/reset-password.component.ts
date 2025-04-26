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
    this.loading = true;
    this.error = null;
    this.message = null;
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
    // Now update the password
    const { error } = await this.supabase.supabase.auth.updateUser({ password: this.password });
    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Password updated!';
    }
  }
}
