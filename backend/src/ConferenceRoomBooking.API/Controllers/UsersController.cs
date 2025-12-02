using System.Security.Claims;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Features.Users.Commands;
using ConferenceRoomBooking.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConferenceRoomBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IMediator mediator, ILogger<UsersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new employee (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        _logger.LogInformation(
            "Admin {AdminName} creating new user with username {Username}",
            adminName, dto.Username);

        var command = new CreateUserCommand
        {
            Username = dto.Username,
            Email = dto.Email,
            Password = dto.Password,
            FirstName = dto.FirstName,
            MiddleName = dto.MiddleName,
            LastName = dto.LastName,
            Role = dto.Role
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Get user by ID (Admin can view any, Employee can view own)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(string id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Non-admins can only view their own profile
        if (currentUserRole != "Admin" && currentUserId != id)
        {
            _logger.LogWarning(
                "User {UserId} attempted to access user {TargetId} profile",
                currentUserId, id);
            return Forbid();
        }

        var result = await _mediator.Send(new GetUserByIdQuery { UserId = id });
        return Ok(result);
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers([FromQuery] bool includeInactive = false)
    {
        _logger.LogInformation("Fetching all users (includeInactive: {IncludeInactive})", includeInactive);

        var result = await _mediator.Send(new GetAllUsersQuery { IncludeInactive = includeInactive });
        return Ok(result);
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        
        _logger.LogInformation("User {UserId} fetching own profile", userId);

        var result = await _mediator.Send(new GetUserByIdQuery { UserId = userId });
        return Ok(result);
    }

    /// <summary>
    /// Update user profile (Users can update own profile, Admin can update any)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateProfile(string id, [FromBody] UpdateProfileDto dto)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Non-admins can only update their own profile
        if (currentUserRole != "Admin" && currentUserId != id)
        {
            _logger.LogWarning(
                "User {UserId} attempted to update user {TargetId} profile",
                currentUserId, id);
            return Forbid();
        }

        _logger.LogInformation("Updating profile for user {UserId}", id);

        var command = new UpdateProfileCommand
        {
            UserId = id,
            FirstName = dto.FirstName,
            MiddleName = dto.MiddleName,
            LastName = dto.LastName,
            Email = dto.Email,
            ProfileImageUrl = dto.ProfileImageUrl
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Change password (Users can change own password)
    /// </summary>
    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto dto)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Users can only change their own password
        if (currentUserId != id)
        {
            _logger.LogWarning(
                "User {UserId} attempted to change password for user {TargetId}",
                currentUserId, id);
            return Forbid();
        }

        _logger.LogInformation("User {UserId} changing password", id);

        var command = new ChangePasswordCommand
        {
            UserId = id,
            CurrentPassword = dto.CurrentPassword,
            NewPassword = dto.NewPassword
        };

        await _mediator.Send(command);
        return Ok(new { message = "Password changed successfully" });
    }

    /// <summary>
    /// Upload profile image for user
    /// </summary>
    [HttpPost("{id}/profile-image")]
    public async Task<ActionResult> UploadProfileImage(string id, IFormFile file)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Non-admins can only upload their own image
        if (currentUserRole != "Admin" && currentUserId != id)
        {
            _logger.LogWarning(
                "User {UserId} attempted to upload image for user {TargetId}",
                currentUserId, id);
            return Forbid();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Invalid file type. Only images are allowed." });
        }

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 5MB limit." });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileName = $"{id}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user's profile image URL
            var imageUrl = $"/uploads/profiles/{fileName}";
            var command = new UpdateProfileCommand
            {
                UserId = id,
                ProfileImageUrl = imageUrl
            };

            var result = await _mediator.Send(command);

            _logger.LogInformation("Profile image uploaded for user {UserId}", id);

            return Ok(new { imageUrl = imageUrl, user = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image for user {UserId}", id);
            return StatusCode(500, new { message = "Error uploading image" });
        }
    }

    /// <summary>
    /// Deactivate user (Admin only)
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateUser(string id)
    {
        var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        _logger.LogInformation("Admin {AdminName} deactivating user {UserId}", adminName, id);

        // This would require a new command, but for now we can use a simple update
        var user = await _mediator.Send(new GetUserByIdQuery { UserId = id });
        
        // In a real implementation, you'd create a DeactivateUserCommand
        return Ok(new { message = "User deactivation would be implemented here" });
    }
}
