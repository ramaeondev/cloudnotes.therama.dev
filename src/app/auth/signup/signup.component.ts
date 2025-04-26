import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { LogoAppnameComponent } from '../../shared/logo-appname/logo-appname.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: false,
})
export class SignupComponent {
  signupForm: FormGroup;
  error: string | null = null;
  loading = false;
  message: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(20)]],
      last_name: ['', [Validators.required, Validators.maxLength(20)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async signUp() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    this.message = null;
    const { first_name, last_name, username, email, password } = this.signupForm.value;
    const { error } = await this.supabase.signUp(
      email,
      password,
      {
        first_name,
        last_name,
        username,
        isFirstLogin: true,
        is_news_letter_subscribed: false,
        is_root_folder_created: false
      }
    );
    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Confirmation email sent!';
      this.signupForm.reset();
      setTimeout(() => {
        this.router.navigate(['/signin']);
      }, 1000);
    }
  }
}
