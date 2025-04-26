import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  template: `<div class="profile-page">
    <h2>Profile</h2>
    <p>This is your profile page. Add your user info here.</p>
  </div>`,
  styles: [`.profile-page { padding: 32px; text-align: center; }`]
})
export class ProfileComponent {}
