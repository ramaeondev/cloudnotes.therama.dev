import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  error: string | null = null;
  message: string | null = null;
  loading = false;
  
  constructor(private supabase: SupabaseService, private fb: FormBuilder, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async sendResetEmail() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    this.message = null;
    const email = this.forgotForm.value.email;
    try {
      const { error } = await this.supabase.resetPassword(email);
      this.loading = false;
      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Password reset email sent! Please check your inbox.';
        this.forgotForm.reset();
        this.router.navigate(['/signin']);
      }
    } catch (err: any) {
      this.loading = false;
      this.error = err.message || 'An unexpected error occurred';
    }
  }
}

