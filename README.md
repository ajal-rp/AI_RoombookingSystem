# Conference Room Booking System

A full-stack conference room booking system built with .NET 8 Web API and Angular 17, featuring JWT authentication, clean architecture, and role-based access control.

## 🚀 Features

### Backend (.NET 8 Web API)
- **Clean Architecture** with Domain, Application, Infrastructure, and API layers
- **CQRS Pattern** using MediatR
- **Entity Framework Core 8** with SQL Server
- **JWT Authentication** with Employee/Admin roles
- **User Management** with profile updates and employee creation
- **AutoMapper** for object mapping
- **FluentValidation** for request validation
- **Serilog** for structured logging
- **Global Exception Handling** middleware
- **Swagger/OpenAPI** documentation
- **Double-booking prevention** logic
- **Comprehensive API endpoints** for room booking and user management

### Frontend (Angular 17)
- **Standalone Components** architecture
- **Angular Material** UI components
- **Role-based routing** with guards
- **JWT token management**
- **Responsive design**
- **Employee Dashboard**: Create booking requests and view status
- **Admin Dashboard**: Review, confirm, or reject booking requests

## 📋 Core Workflow

1. **Employee** submits a booking request for a conference room with date and time
2. **Admin** reviews pending requests
3. **Admin** can **Confirm** (status → Booked) or **Reject** the request
4. System automatically **prevents overlapping bookings**

## 🏗️ Architecture

### Backend Structure
```
backend/
├── ConferenceRoomBooking.sln
└── src/
    ├── Domain/                 # Entities, Enums
    ├── Application/           # DTOs, Commands, Queries, Validators, Interfaces
    ├── Infrastructure/        # DbContext, Services, External dependencies
    └── API/                   # Controllers, Program.cs, Startup
```

### Frontend Structure
```
frontend/
├── package.json
├── angular.json
└── src/app/
│   ├── components/       # Login, Dashboards, Dialogs
│   ├── services/         # Auth, Booking, Room services
│   ├── models/           # TypeScript interfaces
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   └── app.routes.ts     # Route configuration
```

## 🛠️ Technologies

### Backend
- .NET 8
- Entity Framework Core 8
- MediatR (CQRS)
- AutoMapper
- FluentValidation
- JWT Authentication
- BCrypt (password hashing)
- Swagger/OpenAPI

### Frontend
- Angular 17
- Angular Material
- RxJS
- TypeScript
- SCSS

## 📦 Database Entities

### Room
- Id, Name, Capacity, Description

### BookingRequest
- Id, EmployeeId, EmployeeName, RoomId, Date, StartTime, EndTime, Status, CreatedAt, RejectReason

### User
- Id, Username, Email, PasswordHash, FirstName, MiddleName, LastName, FullName (computed)
- ProfileImageUrl, ProfileImagePath, Role (Employee/Admin)
## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (🆕)
- `POST /api/users` - Create new employee (Admin only)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/{id}` - Update user profile
- `POST /api/users/{id}/change-password` - Change password

**See [User Management API Documentation](backend/USER_MANAGEMENT_API.md) for detailed information**

### Rooms
- `GET /api/rooms` - Get all rooms

### Booking Requests
- `POST /api/bookingrequests` - Create booking request (Employee/Admin)
- `GET /api/bookingrequests/pending` - Get pending requests (Admin only)
- `GET /api/bookingrequests/my-requests` - Get employee's requests
- `POST /api/bookingrequests/{id}/confirm` - Confirm request (Admin only)
- `POST /api/bookingrequests/{id}/reject` - Reject request (Admin only)
- `GET /api/bookingrequests/check-availability` - Check room availability
- `POST /api/bookingrequests/{id}/reject` - Reject request (Admin only)
- `GET /api/bookingrequests/check-availability` - Check room availability

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- SQL Server or LocalDB
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. **Navigate to the solution directory**
   ```powershell
   cd "{workspace}\AITutorial"
   ```

2. **Restore NuGet packages**
   ```powershell
   dotnet restore
   ```

3. **Update database connection string** (if needed)
   Edit `backend/src/ConferenceRoomBooking.API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ConferenceRoomBookingDb;Trusted_Connection=true;TrustServerCertificate=true;"
   }
   ```

4. **Apply database migrations**
   ```powershell
   cd backend\src\ConferenceRoomBooking.API
   dotnet ef migrations add InitialCreate --project ..\ConferenceRoomBooking.Infrastructure\ConferenceRoomBooking.Infrastructure.csproj
   dotnet ef database update
   ```

5. **Run the API**
   ```powershell
   dotnet run
   ```
   API will be available at: `https://localhost:7001` (or check console output)

6. **Access Swagger UI**
   Navigate to: `https://localhost:7001/swagger`

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Update API URL** (if needed)
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
## 👤 Demo Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `Password123!`
- **Name**: System Administrator

### Employee Accounts
- **Username**: `john.doe` | **Password**: `Password123!` | **Name**: John Michael Doe
- **Username**: `jane.smith` | **Password**: `Password123!` | **Name**: Jane Smith

## 🔒 Security Features

- JWT token-based authentication
- Role-based authorization (Employee/Admin)
- Password hashing with BCrypt
- Strong password validation (min 8 chars, uppercase, lowercase, number, special char)
- HTTP-only token storage
- Protected API endpoints
- CORS configuration
- Email and username uniqueness enforcementn.doe` | **Password**: `Password123!`
- **Username**: `jane.smith` | **Password**: `Password123!`

## 🔒 Security Features

- JWT token-based authentication
- Role-based authorization (Employee/Admin)
- Password hashing with BCrypt
- HTTP-only token storage
- Protected API endpoints
- CORS configuration

## 📝 Key Features Implementation

### Double-Booking Prevention
The system checks for overlapping bookings before:
1. Creating a new booking request
2. Confirming a pending request

Logic: `(b.StartTime < request.EndTime && b.EndTime > request.StartTime)`

### CQRS Pattern
- **Commands**: CreateBookingRequest, ConfirmBookingRequest, RejectBookingRequest
- **Queries**: GetPendingRequests, GetEmployeeRequests, CheckAvailability, GetAllRooms

### Validation
- FluentValidation for command validation
- Date must be today or future
- End time must be after start time
- Room availability checks

## 🎨 UI Features

### Employee Dashboard
- Create new booking requests
- View all personal booking requests
- See request status (Pending/Booked/Rejected)
- Real-time updates

### Admin Dashboard
- View all pending booking requests
- Confirm or reject requests
- Add rejection reason (optional)
- Prevent double-booking conflicts

## 📄 License

This is a demo project for educational purposes.

## 🤝 Contributing

This is a sample project. Feel free to fork and modify as needed.

## 📧 Support

For issues or questions, please create an issue in the repository.
