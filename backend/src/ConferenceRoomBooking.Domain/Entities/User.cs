using System.ComponentModel.DataAnnotations;

namespace ConferenceRoomBooking.Domain.Entities;

public class User
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    // Name fields
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    
    // Profile image
    public string? ProfileImageUrl { get; set; }
    public string? ProfileImagePath { get; set; }
    
    // Role and metadata
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Computed property for backward compatibility
    public string FullName => string.IsNullOrEmpty(MiddleName) 
        ? $"{FirstName} {LastName}" 
        : $"{FirstName} {MiddleName} {LastName}";
}

public enum UserRole
{
    Employee,
    Admin
}
