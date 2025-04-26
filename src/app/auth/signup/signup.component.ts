import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: false
})
export class SignupComponent {
  email = '';
  password = '';
  confirmPassword = '';
  error: string | null = null;
  loading = false;
  message: string | null = null;
  passwordMismatch = false;

  constructor(private supabase: SupabaseService) {}

  async signUp() {
    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.error = 'Passwords do not match';
      return;
    }
    
    this.passwordMismatch = false;
    this.loading = true;
    this.error = null;
    this.message = null;
    const { error } = await this.supabase.signUp(this.email, this.password);
    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Confirmation email sent!';
    }
  }
}
