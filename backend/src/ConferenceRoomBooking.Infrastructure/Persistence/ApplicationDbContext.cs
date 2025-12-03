using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;
using ConferenceRoomBooking.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<BookingRequest> BookingRequests => Set<BookingRequest>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations from separate files
        modelBuilder.ApplyConfiguration(new RoomConfiguration());
        modelBuilder.ApplyConfiguration(new BookingRequestConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());

        // Add indexes for optimized queries
        modelBuilder.Entity<BookingRequest>()
            .HasIndex(b => new { b.RoomId, b.Date, b.Status })
            .HasDatabaseName("IX_BookingRequests_RoomId_Date_Status");

        modelBuilder.Entity<BookingRequest>()
            .HasIndex(b => b.Status)
            .HasDatabaseName("IX_BookingRequests_Status");

        modelBuilder.Entity<Room>()
            .HasIndex(r => r.Name)
            .HasDatabaseName("IX_Rooms_Name");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .HasDatabaseName("IX_Users_Email");

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Rooms with Location and Amenities
        modelBuilder.Entity<Room>().HasData(
            new Room 
            { 
                Id = 1, 
                Name = "Conference Room A", 
                Location = "2nd Floor, East Wing",
                Capacity = 10, 
                Description = "Large meeting room with projector",
                Amenities = "Projector,Whiteboard,Video Conferencing,Wi-Fi"
            },
            new Room 
            { 
                Id = 2, 
                Name = "Conference Room B", 
                Location = "3rd Floor, West Wing",
                Capacity = 6, 
                Description = "Medium meeting room with whiteboard",
                Amenities = "Whiteboard,Wi-Fi,TV Display"
            },
            new Room 
            { 
                Id = 3, 
                Name = "Executive Board Room", 
                Location = "5th Floor, Executive Suite",
                Capacity = 20, 
                Description = "Executive meeting room with video conferencing",
                Amenities = "Video Conferencing,Projector,Whiteboard,Wi-Fi,Coffee Machine,Smart Board"
            },
            new Room 
            { 
                Id = 4, 
                Name = "Training Room", 
                Location = "1st Floor, Training Center",
                Capacity = 30, 
                Description = "Large training room with multiple screens",
                Amenities = "Multiple Screens,Projector,Wi-Fi,Microphone System,Stage"
            }
        );

        // Seed Users (password: "Password123!" for all users - hashed)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var createdAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = "admin-001", 
                Username = "admin", 
                Email = "admin@company.com",
                PasswordHash = passwordHash,
                FirstName = "System",
                MiddleName = null,
                LastName = "Administrator",
                ProfileImageUrl = null,
                ProfileImagePath = null,
                Role = UserRole.Admin,
                CreatedAt = createdAt,
                LastLoginAt = null,
                IsActive = true
            },
            new User 
            { 
                Id = "emp-001", 
                Username = "john.doe", 
                Email = "john.doe@company.com",
                PasswordHash = passwordHash,
                FirstName = "John",
                MiddleName = "Michael",
                LastName = "Doe",
                ProfileImageUrl = null,
                ProfileImagePath = null,
                Role = UserRole.Employee,
                CreatedAt = createdAt,
                LastLoginAt = null,
                IsActive = true
            },
            new User 
            { 
                Id = "emp-002", 
                Username = "jane.smith", 
                Email = "jane.smith@company.com",
                PasswordHash = passwordHash,
                FirstName = "Jane",
                MiddleName = null,
                LastName = "Smith",
                ProfileImageUrl = null,
                ProfileImagePath = null,
                Role = UserRole.Employee,
                CreatedAt = createdAt,
                LastLoginAt = null,
                IsActive = true
            }
        );
    }
}
