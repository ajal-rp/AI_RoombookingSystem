import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
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
export class MainLayoutComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  currentUser$ = this.authService.currentUser;
  isHandsetMode = false;
  private readonly destroy$ = new Subject<void>();
  
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
    private readonly breakpointObserver: BreakpointObserver,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isHandset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isHandset => {
        this.isHandsetMode = isHandset;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
