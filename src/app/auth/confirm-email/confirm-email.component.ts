import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  standalone: false
})
export class ConfirmEmailComponent implements OnInit {
  message: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.message = 'Your email has been confirmed! You can now sign in.';
    setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 2000);
  }
}

