import { Component } from '@angular/core';

@Component({
  selector: 'app-logo-appname',
  standalone: true,
  template: `
    <div class="logo-appname-row">
      <img src="assets/logo.png" alt="CloudNotes Logo" class="logo-small" />
      <span class="app-title">CloudNotes</span>
    </div>
  `,
  styles: [`
    .logo-appname-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 0 auto 8px auto;
      max-width: 90%;
      text-align: center;
    }
    .logo-small {
      width: 28px;
      height: 28px;
    }
    .app-title {
      font-size: 2.1em;
      font-weight: 900;
      font-family: 'Inter', 'Roboto', sans-serif;
      color: #1976d2;
      letter-spacing: 1.2px;
      vertical-align: middle;
      width: 100%;
      text-align: left;
      line-height: 1.1;
    }
  `]
})
export class LogoAppnameComponent {}
