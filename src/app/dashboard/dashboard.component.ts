import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { NewsletterService } from '../services/newsletter.service';
import { User } from '@supabase/supabase-js';
import { FolderService } from '../services/folder.service';
import { SharedService } from '../services/shared.service';

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
  userName: WritableSignal<string> = signal('');

  constructor(private readonly supabase: SupabaseService, private readonly newsletter: NewsletterService,
    private readonly sharedService: SharedService,
    private readonly folderService: FolderService) { }

  ngOnInit(): void {
    (async () => {
      const { data: { user }, error } = await this.supabase.supabase.auth.getUser();
      this.userData = user;
      this.userName.set(user?.user_metadata?.['username'] ?? '');
      console.log(this.userName());
      if (error || !user) {
        console.error('User not found or error occurred during authentication:', error);
        return;
      }

      if (user) {
        const meta = user.user_metadata;

        // Subscribe to the newsletter if this is the user's first login and they're not already subscribed
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

        // Create root folder if this is the user's first login and the root folder doesn't exist
        if (meta['isFirstLogin'] && !meta['is_root_folder_created'] && typeof user.email === 'string') {
          await this.createRootFolder();
        }

        // If both is_root_folder_created and is_news_letter_subscribed are true, update isFirstLogin to false
        if (meta['is_root_folder_created'] && meta['is_news_letter_subscribed']) {
          this.supabase.updateUserMetadata({
            isFirstLogin: false,
          });
        }
      }
    })();
  }

  async createRootFolder() {
    try {
      await this.folderService.createRootFolder();
      await this.supabase.updateUserMetadata({ is_root_folder_created: true });
      this.isRootFolderCreated.set(true);
      this.sharedService.sendTrigger(true);
    } catch (err) {
      console.error('Error creating root folder:', err);
    }
  }

  logout() {
    this.supabase.signOut();
  }

}
