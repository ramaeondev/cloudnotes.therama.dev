import { Component } from '@angular/core';
import { faHome, faNoteSticky, faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  sidebarOpen = true; // Controls sidebar visibility on mobile
  faHome = faHome;
  faNoteSticky = faNoteSticky;
  faCog = faCog;
  faUserCircle = faUserCircle;

  userName = 'John Doe'; // Replace with actual user data as needed

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}
