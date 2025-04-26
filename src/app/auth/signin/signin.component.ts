import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: false 
})
export class SigninComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private supabase: SupabaseService) {}

  async signIn() {
    this.loading = true;
    this.error = null;
    const { error } = await this.supabase.signIn(this.email, this.password);
    this.loading = false;
    if (error) {
      this.error = error.message;
    }
  }
}
