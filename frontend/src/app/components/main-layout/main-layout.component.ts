import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    NotificationBellComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  currentUser$ = this.authService.currentUser;
  isHandsetMode = false;
  
  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', adminOnly: true },
    { icon: 'home', label: 'My Dashboard', route: '/dashboard/employee', adminOnly: false, employeeOnly: true },
    { icon: 'meeting_room', label: 'Rooms', route: '/dashboard/rooms', adminOnly: false },
    { icon: 'event', label: 'Booking Requests', route: '/dashboard/requests', adminOnly: false },
    { icon: 'calendar_month', label: 'Calendar', route: '/dashboard/calendar', adminOnly: false },
    { icon: 'schedule', label: 'Schedule', route: '/dashboard/schedule', adminOnly: false },
    { icon: 'people', label: 'Users', route: '/dashboard/users', adminOnly: true },
    { icon: 'person', label: 'My Profile', route: '/dashboard/profile', adminOnly: false }
  ];


  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isHandset$.subscribe(isHandset => {
      this.isHandsetMode = isHandset;
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  onMenuItemClick(drawer: any): void {
    if (this.isHandsetMode) {
      drawer.close();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getFilteredMenuItems() {
    if (this.isAdmin()) {
      return this.menuItems.filter(item => !item.employeeOnly);
    }
    return this.menuItems.filter(item => !item.adminOnly);
  }

  getProfileImageUrl(profileImageUrl: string): string {
    if (!profileImageUrl) return '';
    return `${environment.apiUrl.replace('/api', '')}${profileImageUrl}`;
  }
}
