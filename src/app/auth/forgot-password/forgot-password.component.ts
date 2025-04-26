import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false
})
export class ForgotPasswordComponent {
  email = '';
  error: string | null = null;
  message: string | null = null;
  loading = false;

  constructor(private supabase: SupabaseService) {}

  async sendResetEmail() {
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.message = null;
    
    try {
      const { error } = await this.supabase.resetPassword(this.email);
      this.loading = false;
      
      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Password reset email sent! Please check your inbox.';
      }
    } catch (err: any) {
      this.loading = false;
      this.error = err.message || 'An unexpected error occurred';
    }
  }
}
