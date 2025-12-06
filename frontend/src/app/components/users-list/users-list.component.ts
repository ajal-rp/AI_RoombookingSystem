import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/auth.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    CardComponent,
    BackButtonComponent,
    ButtonComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fullName', 'username', 'email', 'role', 'isActive', 'actions'];
  dataSource: MatTableDataSource<UserProfile>;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<UserProfile>([]);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers(false).subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(`Failed to load users: ${error.statusText || error.message}`, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadUsers();
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.userService.createUser(result).subscribe({
          next: (user) => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(`Failed to create user: ${error.error?.message || error.message}`, 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    });
  }

  editUser(user: UserProfile): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.userService.updateProfile(user.id, result).subscribe({
          next: (updatedUser) => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(`Failed to update user: ${error.error?.message || error.message}`, 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to deactivate this user? This action can be reversed by an administrator.')) {
      this.loading = true;
      this.userService.deactivateUser(userId).subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'User deactivated successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(`Failed to deactivate user: ${error.error?.message || error.message}`, 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }
}