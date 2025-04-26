import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `<div class="settings-page">
    <h2>Settings</h2>
    <p>This is your settings page. Add your preferences here.</p>
  </div>`,
  styles: [`.settings-page { padding: 32px; text-align: center; }`]
})
export class SettingsComponent {}
