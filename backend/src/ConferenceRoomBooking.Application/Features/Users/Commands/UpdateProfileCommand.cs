using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Application.Exceptions;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Users.Commands;

public record UpdateProfileCommand : IRequest<UserDto>
{
    public string UserId { get; init; } = string.Empty;
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public string? ProfileImageUrl { get; init; }
}

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateProfileCommandHandler> _logger;

    public UpdateProfileCommandHandler(
        IApplicationDbContext context,
        ILogger<UpdateProfileCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating profile for user {UserId}", request.UserId);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found", request.UserId);
            throw new NotFoundException("User", request.UserId);
        }

        // Check if email is being changed and if it's already taken
        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && u.Id != request.UserId, cancellationToken);

            if (emailExists)
            {
                _logger.LogWarning("Email {Email} already exists", request.Email);
                throw new BusinessRuleException(
                    "Email already exists",
                    $"A user with email '{request.Email}' already exists");
            }

            user.Email = request.Email;
        }

        // Update fields if provided
        if (!string.IsNullOrEmpty(request.FirstName))
            user.FirstName = request.FirstName;

        if (request.MiddleName != null)
            user.MiddleName = request.MiddleName;

        if (!string.IsNullOrEmpty(request.LastName))
            user.LastName = request.LastName;

        if (request.ProfileImageUrl != null)
            user.ProfileImageUrl = request.ProfileImageUrl;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Profile updated successfully for user {UserId}", request.UserId);

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
