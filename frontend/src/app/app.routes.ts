import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { RequestsListComponent } from './components/requests-list/requests-list.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { RoomDetailsComponent } from './components/room-details/room-details.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { RoomsScheduleComponent } from './components/rooms-schedule/rooms-schedule.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        component: DashboardComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'employee',
        component: EmployeeDashboardComponent
      },
      { 
        path: 'users', 
        component: UsersListComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'requests', 
        component: RequestsListComponent
      },
      { 
        path: 'rooms', 
        component: RoomsComponent
      },
      {
        path: 'rooms/add',
        loadComponent: () => import('./components/add-room/add-room.component').then(m => m.AddRoomComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'rooms/:id',
        component: RoomDetailsComponent
      },
      {
        path: 'book-room',
        component: BookingFormComponent
      },
      { 
        path: 'schedule', 
        component: RoomsScheduleComponent
      },
      {
        path: 'calendar',
        loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'book/:id',
        component: BookingFormComponent
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

