import { Component } from '@angular/core';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})

export class DashboardComponent {
  userName = 'John Doe';

  constructor(private supabase: SupabaseService) {}

  logout() {
    this.supabase.signOut();
  }
}
