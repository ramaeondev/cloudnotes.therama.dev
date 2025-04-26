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
    this.loading = true;
    this.error = null;
    this.message = null;
    const { error } = await this.supabase.supabase.auth.resetPasswordForEmail(this.email);
    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Password reset email sent!';
    }
  }
}
