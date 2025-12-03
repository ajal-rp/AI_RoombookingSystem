using System.Security.Claims;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Features.BookingRequests.Commands;
using ConferenceRoomBooking.Application.Features.BookingRequests.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace ConferenceRoomBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingRequestsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<BookingRequestsController> _logger;

    public BookingRequestsController(IMediator mediator, ILogger<BookingRequestsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new booking request (Employee)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Employee,Admin")]
    public async Task<ActionResult<BookingRequestDto>> CreateBookingRequest([FromBody] CreateBookingRequestCommand command)
    {
        // Get employee ID and name from authenticated user
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
        {
            _logger.LogWarning("Unauthorized booking request attempt - missing user claims");
            return Unauthorized(new { message = "User authentication required" });
        }

        _logger.LogInformation(
            "User {UserId} ({UserName}) creating booking request for Room {RoomId}",
            userId, userName, command.RoomId);

        var commandWithUser = command with 
        { 
            EmployeeId = userId, 
            EmployeeName = userName 
        };

        var result = await _mediator.Send(commandWithUser);
        return CreatedAtAction(nameof(GetEmployeeBookingRequests), new { }, result);
    }

    /// <summary>
    /// Get all pending booking requests (Admin only)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<BookingRequestDto>>> GetPendingBookingRequests()
    {
        var requests = await _mediator.Send(new GetPendingBookingRequestsQuery());
        return Ok(requests);
    }

    /// <summary>
    /// Get all booking requests with optional filters (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetAllBookingRequests(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var requests = await _mediator.Send(new GetAllBookingRequestsQuery
        {
            Status = status,
            StartDate = startDate,
            EndDate = endDate,
            Page = page,
            PageSize = pageSize
        });
        
        return Ok(requests);
    }

    /// <summary>
    /// Get booking requests for the authenticated employee
    /// </summary>
    [HttpGet("my-requests")]
    [Authorize(Roles = "Employee,Admin")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")]
    public async Task<ActionResult<List<BookingRequestDto>>> GetEmployeeBookingRequests()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        var requests = await _mediator.Send(new GetEmployeeBookingRequestsQuery { EmployeeId = userId });
        return Ok(requests);
    }

    /// <summary>
    /// Confirm a booking request (Admin only)
    /// </summary>
    [HttpPost("{id}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ConfirmBookingRequest(int id)
    {
        var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        _logger.LogInformation("Admin {AdminName} confirming booking request {BookingId}", adminName, id);

        var result = await _mediator.Send(new ConfirmBookingRequestCommand { Id = id });
        return Ok(new { message = "Booking request confirmed successfully", success = result });
    }

    /// <summary>
    /// Reject a booking request (Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> RejectBookingRequest(int id, [FromBody] RejectBookingRequestCommand command)
    {
        var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        _logger.LogInformation(
            "Admin {AdminName} rejecting booking request {BookingId} with reason: {Reason}",
            adminName, id, command.RejectReason ?? "No reason provided");

        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId);
        return Ok(new { message = "Booking request rejected successfully", success = result });
    }

    /// <summary>
    /// Check room availability
    /// </summary>
    [HttpGet("check-availability")]
    public async Task<ActionResult<bool>> CheckRoomAvailability(
        [FromQuery] int roomId,
        [FromQuery] DateTime date,
        [FromQuery] TimeSpan startTime,
        [FromQuery] TimeSpan endTime)
    {
        var isAvailable = await _mediator.Send(new CheckRoomAvailabilityQuery
        {
            RoomId = roomId,
            Date = date,
            StartTime = startTime,
            EndTime = endTime
        });

        return Ok(new { available = isAvailable });
    }
}
