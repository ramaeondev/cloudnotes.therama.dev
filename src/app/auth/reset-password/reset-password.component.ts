import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: false
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  error: string | null = null;
  message: string | null = null;
  loading = false;
  token: string = '';
  refreshToken: string = '';

  constructor(private supabase: SupabaseService, private fb: FormBuilder, private router: Router) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async resetPassword(accessToken: string, refreshToken: string) {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    this.message = null;
    const password = this.resetForm.value.password;
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
      const { error } = await this.supabase.updatePassword(password);
      this.loading = false;
      
      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Password updated successfully! You can now sign in with your new password.';
        this.resetForm.reset();
        this.router.navigate(['/signin']);
      }
    } catch (err: any) {
      this.loading = false;
      this.error = err.message || 'An unexpected error occurred';
    }
  }
}
