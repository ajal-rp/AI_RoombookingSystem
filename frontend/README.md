# Conference Room Booking System - Frontend

## Overview

Angular 17 standalone component-based application for managing conference room bookings with role-based access control (Admin/Employee).

## Technology Stack

- **Framework**: Angular 17 (Standalone Components)
- **UI Library**: Angular Material
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Authentication**: JWT-based
- **Styling**: SCSS with Material Design
- **Build Tool**: Angular CLI

## Project Structure

```
frontend/src/
├── app/
│   ├── components/           # Feature components
│   │   ├── auth/            # Authentication components
│   │   │   ├── login/       # Login page
│   │   │   └── register/    # User registration
│   │   ├── dashboard/       # Main dashboard
│   │   ├── users-list/      # User management (Admin)
│   │   ├── rooms-schedule/  # Room availability schedule
│   │   ├── requests-list/   # Booking requests management
│   │   ├── book-room/       # Room booking form
│   │   ├── profile/         # User profile management
│   │   └── reject-dialog/   # Rejection reason dialog
│   ├── guards/              # Route guards
│   │   ├── auth.guard.ts    # Authentication guard
│   │   └── admin.guard.ts   # Admin role guard
│   ├── interceptors/        # HTTP interceptors
│   │   └── auth.interceptor.ts  # JWT token interceptor
│   ├── models/              # TypeScript interfaces
│   │   ├── auth.model.ts    # User & authentication models
│   │   ├── booking.model.ts # Booking request models
│   │   └── room.model.ts    # Room models
│   ├── services/            # API services
│   │   ├── auth.service.ts  # Authentication service
│   │   ├── booking.service.ts # Booking operations
│   │   ├── user.service.ts  # User management
│   │   └── room.service.ts  # Room operations
│   ├── shared/              # Shared components
│   │   └── components/      # Reusable UI components
│   │       ├── button/      # Custom button component
│   │       ├── badge/       # Status badge component
│   │       └── card/        # Card wrapper component
│   ├── app.component.ts     # Root component
│   ├── app.config.ts        # Application configuration
│   └── app.routes.ts        # Route definitions
├── environments/            # Environment configurations
│   ├── environment.ts       # Development config
│   └── environment.prod.ts  # Production config
└── styles/                  # Global styles
    ├── _table-theme.scss    # Material table theme
    └── styles.scss          # Global styles & variables
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Route guards for protected routes
- Automatic token refresh
- Secure logout

### User Management (Admin Only)
- View all users with Material Table
- Sortable and paginated user list
- User status indicators (Active/Inactive)
- Role badges (Admin/Employee)
- Filter and search capabilities

### Room Schedule & Availability
- Real-time room status (Available/Occupied/Reserved)
- Current booking information display
- Next booking preview
- Today's booking count
- Color-coded status indicators
- Auto-refresh capabilities

### Booking Management
- Create new booking requests
- View all bookings (Admin) or personal bookings (Employee)
- Filter by status (Pending/Booked/Rejected)
- Filter by time (Today/Upcoming/Past)
- Search functionality
- Approve/Reject requests (Admin)
- Edit/Delete pending requests (Employee)

### User Profile
- View and update profile information
- Change password
- Upload profile image
- View booking history

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   
   Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7001/api'  // Backend API URL
   };
   ```

3. **Run development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Access the application**
   
   Navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
# or
ng build --configuration production
```

Build artifacts will be stored in `dist/` directory.

## Configuration

### API Endpoint Configuration

Located in `src/environments/`:
- `environment.ts` - Development settings
- `environment.prod.ts` - Production settings

### Material Theme

Custom Material Design theme configured in `src/styles.scss`:
- Primary color: Blue (#2563EB)
- Accent color: Purple (#8b5cf6)
- Typography: Inter font family

## Authentication Flow

1. User logs in via `/login`
2. JWT token received and stored in localStorage
3. Token automatically attached to all API requests via interceptor
4. Token validated on protected routes via auth guard
5. User redirected to login if token invalid/expired

## User Roles & Permissions

### Admin
- ✅ View all users
- ✅ View all booking requests
- ✅ Approve/Reject booking requests
- ✅ View room schedules
- ✅ Access admin dashboard

### Employee
- ✅ Create booking requests
- ✅ View own booking requests
- ✅ Edit/Delete own pending requests
- ✅ View room schedules
- ✅ Manage own profile

## Components Overview

### Material Table Components
All tables use Angular Material Table with:
- Sorting on all columns
- Pagination (10, 25, 50 items per page)
- Loading states with spinners
- Empty state messages
- Responsive design
- Hover effects

### Shared Components
- **Button**: Customizable button with variants (primary, outline, text)
- **Badge**: Status indicators with color coding
- **Card**: Container component with elevation

### Form Components
- Material form fields
- Client-side validation
- Error message display
- Loading states during submission

## Styling Architecture

### Design System
- CSS Variables for theming
- Consistent spacing scale
- Color palette with semantic naming
- Typography system
- Border radius scale

### SCSS Structure
- Component-scoped styles
- Global variables in `styles.scss`
- Material theme overrides
- Responsive breakpoints

## API Integration

### Services
All services use:
- HttpClient for API calls
- RxJS Observables
- Error handling with catchError
- Retry logic for failed requests
- Type-safe response models

### HTTP Interceptor
- Automatically adds JWT token to requests
- Handles 401 unauthorized responses
- Redirects to login on authentication failure

## State Management

- Component-level state using RxJS BehaviorSubject
- Service-based state for authentication
- No external state management library (minimal complexity)

## Error Handling

- Global error interceptor
- User-friendly error messages via Material Snackbar
- Console logging for debugging
- Validation error display on forms

## Best Practices Implemented

- ✅ Standalone components (Angular 17+)
- ✅ Reactive forms with validation
- ✅ Type-safe models with TypeScript
- ✅ Route guards for security
- ✅ Lazy loading for performance
- ✅ Material Design principles
- ✅ Responsive mobile-first design
- ✅ Accessibility considerations
- ✅ Clean code architecture
- ✅ Separation of concerns

## Testing

### Run Unit Tests
```bash
npm test
# or
ng test
```

### Run E2E Tests
```bash
npm run e2e
# or
ng e2e
```

## Common Issues & Solutions

### CORS Errors
- Ensure backend CORS policy allows `http://localhost:4200`
- Check API URL in environment config

### Authentication Issues
- Clear localStorage and try logging in again
- Verify JWT token is valid
- Check backend is running

### Material Icons Not Loading
- Ensure Material Icons font is imported in `index.html`
- Check internet connectivity for CDN

## Development Tips

### Hot Module Replacement
Angular CLI provides HMR by default. Changes are reflected instantly.

### Debugging
- Use Angular DevTools Chrome extension
- Enable source maps in development
- Use browser DevTools network tab for API debugging

### Code Formatting
- Use Angular CLI formatting: `ng lint`
- ESLint configuration included
- Prettier integration recommended

## Deployment

### Environment-Specific Builds
```bash
# Development
ng build

# Production
ng build --configuration production

# Staging
ng build --configuration staging
```

### Deployment Platforms
- **Azure Static Web Apps**: Recommended
- **Netlify**: Simple deployment
- **AWS S3 + CloudFront**: Enterprise solution
- **IIS**: Windows server deployment

## Performance Optimization

- Lazy loading of routes
- OnPush change detection strategy
- Material table virtual scrolling for large datasets
- Image optimization with lazy loading
- Tree-shaking in production builds
- AOT compilation enabled

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Input sanitization on all forms
- XSS protection via Angular's built-in sanitization
- CSRF token handling (if required)
- Secure HTTP interceptor

## Future Enhancements

- [ ] Real-time notifications with SignalR
- [ ] Calendar view for bookings
- [ ] Email notifications
- [ ] Recurring bookings
- [ ] Room equipment management
- [ ] Mobile app version
- [ ] Dark mode support
- [ ] Multi-language support (i18n)

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review console errors
3. Check network tab for API issues
4. Verify backend is running
5. Clear browser cache and localStorage

## License

This project is proprietary software for conference room booking management.

## Version History

- **v1.0.0** (2025-12-02)
  - Initial release
  - User authentication
  - Room booking management
  - Admin dashboard
  - Material Design UI
  - Migrated from AG Grid to Material Table
