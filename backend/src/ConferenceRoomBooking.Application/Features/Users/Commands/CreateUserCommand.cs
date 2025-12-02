using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Application.Exceptions;
using ConferenceRoomBooking.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Users.Commands;

public record CreateUserCommand : IRequest<UserDto>
{
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string Role { get; init; } = "Employee";
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(
        IApplicationDbContext context,
        ILogger<CreateUserCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Creating new user with username: {Username}, role: {Role}",
            request.Username, request.Role);

        // Check if username already exists
        var existingUsername = await _context.Users
            .AnyAsync(u => u.Username == request.Username, cancellationToken);

        if (existingUsername)
        {
            _logger.LogWarning("Username {Username} already exists", request.Username);
            throw new BusinessRuleException(
                "Username already exists",
                $"A user with username '{request.Username}' already exists");
        }

        // Check if email already exists
        var existingEmail = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (existingEmail)
        {
            _logger.LogWarning("Email {Email} already exists", request.Email);
            throw new BusinessRuleException(
                "Email already exists",
                $"A user with email '{request.Email}' already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Generate unique ID
        var userId = $"{(request.Role.ToLower() == "admin" ? "admin" : "emp")}-{Guid.NewGuid():N}";

        var user = new User
        {
            Id = userId,
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Role = request.Role.ToLower() == "admin" ? UserRole.Admin : UserRole.Employee,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} created successfully with username {Username}",
            user.Id, user.Username);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            FullName = user.FullName,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            IsActive = user.IsActive
        };
    }
}
