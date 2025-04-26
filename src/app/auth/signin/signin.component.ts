import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: false 
})
export class SigninComponent {
  signinForm: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(private supabase: SupabaseService, private fb: FormBuilder) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async signIn() {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const { email, password } = this.signinForm.value;
    const { error } = await this.supabase.signIn(email, password);
    this.loading = false;
    if (error) {
      this.error = error.message;
    }
  }
}

