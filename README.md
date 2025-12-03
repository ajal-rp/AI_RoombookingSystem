# Conference Room Booking System

A full-stack web application for managing conference room bookings with role-based access control.

## 📋 Features

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

## 📦 Installation

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- SQL Server or LocalDB
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. **Navigate to the API directory**
   ```bash
   cd backend/src/ConferenceRoomBooking.API
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update database connection string** (if needed)
   Edit `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ConferenceRoomBookingDb;Trusted_Connection=true;TrustServerCertificate=true;"
   }
   ```

4. **Apply database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```
   API will be available at: `https://localhost:7001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL** (if needed)
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7001/api'
   };
   ```

4. **Start development server**
   ```bash
   ng serve
   ```
   Frontend will be available at: `http://localhost:4200`

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Employee Account:**
- Username: `john.doe`
- Password: `Employee@123`

⚠️ Change these in production!

## 🏗️ Project Structure

```
.
├── backend/                 # ASP.NET Core Web API
│   ├── ConferenceRoomBooking.sln
│   └── src/
│       ├── ConferenceRoomBooking.API/
│       ├── ConferenceRoomBooking.Application/
│       ├── ConferenceRoomBooking.Domain/
│       └── ConferenceRoomBooking.Infrastructure/
├── frontend/               # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── models/
│   │   └── environments/
│   ├── angular.json
│   └── package.json
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
dotnet test --verbosity normal
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **AJALRP** - [ajal-rp](https://github.com/ajal-rp)

## 🙏 Acknowledgments

- Angular Material for UI components
- ASP.NET Core for backend framework
- Entity Framework Core for ORM
- MediatR for CQRS implementation

---

⭐ Star this repository if you find it helpful!
