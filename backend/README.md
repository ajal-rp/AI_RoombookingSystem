# Conference Room Booking System - Backend API

## Overview

ASP.NET Core 8.0 Web API for managing conference room bookings with Clean Architecture, CQRS pattern, and role-based authorization.

## Technology Stack

- **Framework**: ASP.NET Core 8.0 Web API
- **Architecture**: Clean Architecture + CQRS
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server / SQLite (In-Memory for development)
- **Authentication**: JWT Bearer Tokens
- **Validation**: FluentValidation
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI
- **Mediator**: MediatR
- **Mapper**: AutoMapper

## Project Structure

```
backend/
├── src/
│   ├── ConferenceRoomBooking.API/          # Presentation Layer
│   │   ├── Controllers/                    # API Controllers
│   │   │   ├── AuthController.cs          # Authentication endpoints
│   │   │   ├── UsersController.cs         # User management
│   │   │   ├── RoomsController.cs         # Room operations
│   │   │   ├── BookingRequestsController.cs # Booking management
│   │   │   └── NotificationsController.cs # Notifications
│   │   ├── Middleware/                     # Custom middleware
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── RequestLoggingMiddleware.cs
│   │   ├── Converters/                     # JSON converters
│   │   │   └── TimeSpanJsonConverter.cs
│   │   ├── Properties/                     # Launch settings
│   │   ├── wwwroot/                        # Static files
│   │   │   └── uploads/                    # User uploads
│   │   ├── appsettings.json               # Configuration
│   │   ├── appsettings.Development.json   # Dev config
│   │   └── Program.cs                      # Application entry point
│   │
│   ├── ConferenceRoomBooking.Application/  # Application Layer
│   │   ├── Features/                       # CQRS Features
│   │   │   ├── Users/                     # User feature
│   │   │   │   ├── Commands/              # User commands
│   │   │   │   └── Queries/               # User queries
│   │   │   ├── Rooms/                     # Room feature
│   │   │   │   ├── Commands/
│   │   │   │   └── Queries/
│   │   │   └── BookingRequests/           # Booking feature
│   │   │       ├── Commands/
│   │   │       └── Queries/
│   │   ├── DTOs/                          # Data Transfer Objects
│   │   │   ├── AuthDto.cs
│   │   │   ├── RoomDto.cs
│   │   │   └── BookingRequestDto.cs
│   │   ├── Interfaces/                     # Application interfaces
│   │   │   ├── IApplicationDbContext.cs
│   │   │   ├── INotificationService.cs
│   │   │   └── IJwtTokenService.cs
│   │   ├── Validators/                     # FluentValidation validators
│   │   ├── Mappings/                       # AutoMapper profiles
│   │   ├── Behaviors/                      # MediatR behaviors
│   │   │   ├── ValidationBehavior.cs
│   │   │   └── LoggingBehavior.cs
│   │   └── Exceptions/                     # Custom exceptions
│   │       ├── ValidationException.cs
│   │       ├── NotFoundException.cs
│   │       └── BusinessRuleException.cs
│   │
│   ├── ConferenceRoomBooking.Domain/       # Domain Layer
│   │   ├── Entities/                       # Domain entities
│   │   │   ├── User.cs
│   │   │   ├── Room.cs
│   │   │   ├── BookingRequest.cs
│   │   │   └── Notification.cs
│   │   ├── Enums/                          # Domain enumerations
│   │   └── Common/                         # Base classes
│   │
│   └── ConferenceRoomBooking.Infrastructure/ # Infrastructure Layer
│       ├── Persistence/                    # Database context
│       │   ├── ApplicationDbContext.cs
│       │   └── DbInitializer.cs           # Seed data
│       ├── Services/                       # Service implementations
│       │   ├── JwtTokenService.cs
│       │   ├── NotificationService.cs
│       │   └── PasswordHasher.cs
│       └── DependencyInjection.cs         # DI registration
│
└── ConferenceRoomBooking.sln              # Solution file
```

## Clean Architecture Layers

### 1. Domain Layer (Core)
- **Pure business logic**
- No dependencies on other layers
- Contains entities, value objects, enums
- Domain events and interfaces

### 2. Application Layer
- **Business use cases**
- CQRS commands and queries
- DTOs for data transfer
- Validation with FluentValidation
- MediatR pipeline behaviors
- Application interfaces

### 3. Infrastructure Layer
- **External concerns**
- Database context and migrations
- External service implementations
- File storage
- Email services
- Third-party integrations

### 4. API Layer (Presentation)
- **HTTP endpoints**
- Controllers with minimal logic
- Request/response models
- Authentication & Authorization
- Middleware pipeline
- API documentation

## Database Schema

### Users Table
```sql
- Id (string, PK)
- Username (string, unique)
- Email (string, unique)
- PasswordHash (string)
- FirstName (string)
- MiddleName (string, nullable)
- LastName (string)
- ProfileImageUrl (string, nullable)
- Role (enum: Admin/Employee)
- CreatedAt (datetime)
- LastLoginAt (datetime, nullable)
- IsActive (bool)
```

### Rooms Table
```sql
- Id (string, PK)
- Name (string, unique)
- Location (string)
- Capacity (int)
- Equipment (string, comma-separated)
- IsActive (bool)
```

### BookingRequests Table
```sql
- Id (int, PK, identity)
- RoomId (string, FK)
- EmployeeId (string, FK)
- Date (date)
- StartTime (TimeSpan)
- EndTime (TimeSpan)
- Purpose (string)
- Status (enum: Pending/Booked/Rejected)
- RejectedReason (string, nullable)
- CreatedAt (datetime)
- UpdatedAt (datetime, nullable)
```

### Notifications Table
```sql
- Id (int, PK, identity)
- UserId (string, FK)
- Message (string)
- Type (enum: BookingConfirmed/BookingRejected/etc)
- IsRead (bool)
- CreatedAt (datetime)
```

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server (or use in-memory database for development)
- Visual Studio 2022 or VS Code
- Postman (for API testing)

### Installation

1. **Clone and navigate**
   ```bash
   cd backend/src/ConferenceRoomBooking.API
   ```

2. **Configure database**
   
   Update `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ConferenceRoomBookingDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

3. **Apply migrations**
   ```bash
   dotnet ef database update
   # or run the application (auto-migration enabled)
   ```

4. **Configure JWT settings**
   
   In `appsettings.json`:
   ```json
   {
     "JwtSettings": {
       "SecretKey": "your-super-secret-key-min-32-chars",
       "Issuer": "ConferenceRoomBookingAPI",
       "Audience": "ConferenceRoomBookingClient",
       "ExpiryInMinutes": 60
     }
   }
   ```

5. **Run the application**
   ```bash
   dotnet run
   # or
   dotnet watch run  # for hot reload
   ```

6. **Access Swagger UI**
   
   Navigate to `https://localhost:7001/swagger`

## API Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth/login
Login with username and password
```json
Request:
{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "admin-001",
  "username": "admin",
  "fullName": "System Administrator",
  "role": "Admin"
}
```

#### POST /api/auth/register
Register new employee (Admin only)
```json
Request:
{
  "username": "john.doe",
  "email": "john@company.com",
  "password": "Pass@123",
  "firstName": "John",
  "middleName": "M",
  "lastName": "Doe",
  "role": "Employee"
}
```

### Users (`/api/users`)

#### GET /api/users
Get all users (Admin only)
- Query params: `includeInactive` (bool)

#### GET /api/users/{id}
Get user by ID

#### GET /api/users/profile
Get current user profile

#### PUT /api/users/{id}
Update user profile

#### POST /api/users/{id}/change-password
Change user password

#### POST /api/users/{id}/profile-image
Upload profile image

#### POST /api/users/{id}/deactivate
Deactivate user (Admin only)

### Rooms (`/api/rooms`)

#### GET /api/rooms
Get all rooms
- Query params: `includeInactive` (bool)

#### GET /api/rooms/{id}
Get room by ID

#### GET /api/rooms/schedule
Get room availability schedule

#### GET /api/rooms/{id}/availability
Check room availability for date range

#### POST /api/rooms
Create new room (Admin only)

#### PUT /api/rooms/{id}
Update room (Admin only)

#### DELETE /api/rooms/{id}
Delete room (Admin only)

### Booking Requests (`/api/bookingrequests`)

#### GET /api/bookingrequests
Get all booking requests (Admin only)
- Query params: `status`, `startDate`, `endDate`, `page`, `pageSize`

#### GET /api/bookingrequests/pending
Get pending requests (Admin only)

#### GET /api/bookingrequests/my-requests
Get current user's requests

#### GET /api/bookingrequests/{id}
Get booking request by ID

#### POST /api/bookingrequests
Create new booking request

#### PUT /api/bookingrequests/{id}
Update booking request

#### DELETE /api/bookingrequests/{id}
Delete booking request

#### POST /api/bookingrequests/{id}/confirm
Confirm booking request (Admin only)

#### POST /api/bookingrequests/{id}/reject
Reject booking request (Admin only)

#### POST /api/bookingrequests/check-availability
Check availability before booking

### Notifications (`/api/notifications`)

#### GET /api/notifications
Get current user's notifications

#### GET /api/notifications/unread-count
Get unread notification count

#### POST /api/notifications/{id}/mark-read
Mark notification as read

#### POST /api/notifications/mark-all-read
Mark all notifications as read

## Authentication & Authorization

### JWT Bearer Token
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Role-Based Access
- **Admin**: Full access to all endpoints
- **Employee**: Limited to own resources

### Default Users (Seeded)
```
Admin:
- Username: admin
- Password: Admin@123
- Role: Admin

Employees:
- Username: john.doe
- Password: Employee@123
- Role: Employee
```

## CQRS Pattern Implementation

### Commands (Write Operations)
```csharp
// Example: Create Booking Request
public class CreateBookingRequestCommand : IRequest<BookingRequestDto>
{
    public string RoomId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Purpose { get; set; }
}

public class CreateBookingRequestHandler : IRequestHandler<CreateBookingRequestCommand, BookingRequestDto>
{
    // Handler implementation
}
```

### Queries (Read Operations)
```csharp
// Example: Get All Rooms
public record GetAllRoomsQuery : IRequest<List<RoomDto>>
{
    public bool IncludeInactive { get; init; }
}

public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, List<RoomDto>>
{
    // Handler implementation
}
```

## Validation

### FluentValidation
All commands are validated using FluentValidation:

```csharp
public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequestCommand>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.Date).GreaterThanOrEqualTo(DateTime.Today);
        RuleFor(x => x.StartTime).LessThan(x => x.EndTime);
        RuleFor(x => x.Purpose).NotEmpty().MaximumLength(500);
    }
}
```

## Logging

### Serilog Configuration
- Console logging with structured output
- File logging with rolling intervals
- Request/response logging middleware
- Performance logging for slow queries

### Log Levels
- **Information**: Standard operations
- **Warning**: Validation failures, business rule violations
- **Error**: Exceptions, system errors
- **Fatal**: Critical system failures

## Error Handling

### Global Exception Middleware
Catches all exceptions and returns consistent error response:

```json
{
  "title": "An error occurred",
  "status": 400,
  "detail": "Validation failed",
  "errors": {
    "RoomId": ["Room ID is required"],
    "Date": ["Date must be in the future"]
  }
}
```

### Custom Exceptions
- `ValidationException`: FluentValidation errors
- `NotFoundException`: Entity not found
- `BusinessRuleException`: Business logic violations
- `UnauthorizedException`: Authentication failures

## Middleware Pipeline

1. **Exception Handling Middleware**
2. **Response Compression**
3. **Static Files**
4. **CORS Policy**
5. **HTTPS Redirection**
6. **Authentication**
7. **Authorization**
8. **Request Logging Middleware**
9. **MVC Controllers**

## Database Migrations

### Create Migration
```bash
dotnet ef migrations add MigrationName --project ConferenceRoomBooking.Infrastructure --startup-project ConferenceRoomBooking.API
```

### Apply Migration
```bash
dotnet ef database update --project ConferenceRoomBooking.Infrastructure --startup-project ConferenceRoomBooking.API
```

### Remove Last Migration
```bash
dotnet ef migrations remove --project ConferenceRoomBooking.Infrastructure --startup-project ConferenceRoomBooking.API
```

## Testing

### Unit Tests
```bash
dotnet test
```

### Integration Tests
- API endpoint testing with WebApplicationFactory
- Database testing with in-memory provider
- Authentication flow testing

## Performance Optimization

- **Response Caching**: Enabled for read-heavy endpoints
- **Compression**: Brotli and Gzip compression
- **Async/Await**: All I/O operations are asynchronous
- **Pagination**: Large datasets paginated
- **Indexing**: Database indexes on frequently queried columns
- **Query Optimization**: EF Core query optimization

## Security Best Practices

- ✅ JWT token authentication
- ✅ Password hashing with BCrypt
- ✅ CORS policy configuration
- ✅ HTTPS enforcement
- ✅ Input validation
- ✅ SQL injection prevention (EF Core parameterized queries)
- ✅ XSS protection
- ✅ Rate limiting (optional)
- ✅ API versioning ready

## Configuration

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "..."
  },
  "JwtSettings": {
    "SecretKey": "...",
    "Issuer": "...",
    "Audience": "...",
    "ExpiryInMinutes": 60
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

## Deployment

### Production Checklist
- [ ] Update JWT secret key
- [ ] Configure production database connection
- [ ] Enable HTTPS certificate
- [ ] Configure CORS for production domain
- [ ] Set up application insights
- [ ] Configure email service
- [ ] Enable health checks
- [ ] Set up monitoring and alerts

### Deployment Options
- **Azure App Service**: Recommended
- **Docker Container**: Containerized deployment
- **IIS**: Windows server deployment
- **Linux Server**: With Nginx reverse proxy

### Docker Deployment
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ConferenceRoomBooking.API.dll"]
```

## Monitoring & Health Checks

### Health Check Endpoints
```csharp
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");
app.MapHealthChecks("/health/live");
```

### Application Insights
- Request tracking
- Dependency tracking
- Exception tracking
- Custom metrics

## Common Issues & Solutions

### Database Connection
- Verify connection string
- Check SQL Server is running
- Ensure database exists (auto-created on first run)

### JWT Token Issues
- Verify secret key is at least 32 characters
- Check token expiry time
- Validate issuer and audience

### CORS Errors
- Update CORS policy in Program.cs
- Allow frontend origin (http://localhost:4200)

## Future Enhancements

- [ ] SignalR for real-time notifications
- [ ] Email notifications with SendGrid
- [ ] Calendar integration (Outlook/Google)
- [ ] Recurring bookings
- [ ] Room equipment tracking
- [ ] Usage analytics and reporting
- [ ] Multi-tenancy support
- [ ] GraphQL API
- [ ] API rate limiting
- [ ] Redis caching

## Contributing Guidelines

1. Follow Clean Architecture principles
2. Use CQRS for all features
3. Add FluentValidation for all commands
4. Write unit tests for business logic
5. Document all public APIs
6. Use async/await for I/O operations
7. Follow C# coding conventions

## License

This project is proprietary software for conference room booking management.

## Version History

- **v1.0.0** (2025-12-02)
  - Initial release
  - Clean Architecture implementation
  - CQRS pattern with MediatR
  - JWT authentication
  - FluentValidation
  - Serilog logging
  - Swagger documentation
  - Entity Framework Core 8.0

## Support

For technical support or questions:
1. Check API documentation at /swagger
2. Review logs in /logs directory
3. Check database connection
4. Verify JWT configuration
5. Review Serilog output for detailed errors
