import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  standalone: false
})
export class ConfirmEmailComponent implements OnInit {
  error: string | null = null;
  message: string | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService
  ) {}
  
  ngOnInit() {
    // Check if the user is already confirmed and signed in
    this.supabase.getUser().then(user => {
      if (user) {
        this.loading = false;
        this.message = 'Your email has been confirmed. You are now signed in.';
        
        // Redirect to home after a short delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        // User is not signed in, so we're waiting for them to check their email
        this.loading = false;
      }
    });
    
    // Handle token from URL if present
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      
      if (token && email) {
        this.verifyEmail(token, email);
      }
    });
  }
  
  private async verifyEmail(token: string, email: string) {
    try {
      this.loading = true;
      const { error } = await this.supabase.verifyOtp(token, email);
      
      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Email confirmed successfully! You can now sign in.';
        
        // Redirect to signin after a short delay
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2000);
      }
    } catch (err: any) {
      this.error = err.message || 'An error occurred during email confirmation';
    } finally {
      this.loading = false;
    }
  }
}
