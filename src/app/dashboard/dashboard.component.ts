import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { NewsletterService } from '../services/newsletter.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})

export class DashboardComponent implements OnInit {
  userData: User | null = null;
  isNewsLetterSubscribed: WritableSignal<boolean> = signal(false);
  isRootFolderCreated: WritableSignal<boolean> = signal(false);  
  constructor(private supabase: SupabaseService, private newsletter: NewsletterService) { }

  async ngOnInit() {
    
    const { data: { user } } = await this.supabase.supabase.auth.getUser();
    this.userData = user;
    if (user) {
      const meta = user.user_metadata;
    
    if (meta['isFirstLogin'] && !meta['is_news_letter_subscribed'] && typeof user.email === 'string') {
      this.newsletter.subscribe(user.email).subscribe({
        next: (result) => {
          if (
            result.message === 'Already subscribed' ||
            result.message === 'Successfully subscribed'
          ) {
            this.supabase.updateUserMetadata({
              is_news_letter_subscribed: true
            });
            this.isNewsLetterSubscribed.set(true);
          }
        },
        error: (error) => {
          console.error('Newsletter subscribe error:', error);
        }
      });
    }

    if(meta['isFirstLogin'] && !meta['is_root_folder_created'] && typeof user.email === 'string') {
      this.createRootFolder(user);
    }
  }
  }
  
  async createRootFolder(user: User) {
    const { data, error } = await this.supabase.supabase.from('folders').insert({
      user_id: user.id,
      name: 'Root Folder',
      parent_id: null
    });
    if (!error) {
      this.supabase.updateUserMetadata({
        is_root_folder_created: true
      });
      this.isRootFolderCreated.set(true);
    } else {
      console.error('Failed to create root folder:', error);
    } 
  }

  logout() {
    this.supabase.signOut();
  }
}
