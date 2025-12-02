using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Application.Exceptions;
using ConferenceRoomBooking.Domain.Entities;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Commands;

public record CreateBookingRequestCommand : IRequest<BookingRequestDto>
{
    public string EmployeeId { get; init; } = string.Empty;
    public string EmployeeName { get; init; } = string.Empty;
    public int RoomId { get; init; }
    public DateTime Date { get; init; }
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
    public string Purpose { get; init; } = string.Empty;
}

public class CreateBookingRequestCommandHandler : IRequestHandler<CreateBookingRequestCommand, BookingRequestDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateBookingRequestCommandHandler> _logger;
    private readonly INotificationService _notificationService;

    public CreateBookingRequestCommandHandler(
        IApplicationDbContext context, 
        IMapper mapper,
        ILogger<CreateBookingRequestCommandHandler> logger,
        INotificationService notificationService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<BookingRequestDto> Handle(CreateBookingRequestCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Creating booking request for Employee {EmployeeId} for Room {RoomId} on {Date} from {StartTime} to {EndTime}",
            request.EmployeeId, request.RoomId, request.Date, request.StartTime, request.EndTime);

        // Check if room exists
        var room = await _context.Rooms.FindAsync(new object[] { request.RoomId }, cancellationToken);
        if (room == null)
        {
            _logger.LogWarning("Room {RoomId} not found", request.RoomId);
            throw new NotFoundException("Room", request.RoomId);
        }

        // Validate time range
        if (request.StartTime >= request.EndTime)
        {
            _logger.LogWarning("Invalid time range: Start {StartTime} >= End {EndTime}", request.StartTime, request.EndTime);
            throw new BusinessRuleException(
                "Start time must be before end time",
                $"Start: {request.StartTime}, End: {request.EndTime}");
        }

        // Check for overlapping bookings
        var hasOverlap = await _context.BookingRequests
            .AnyAsync(b => 
                b.RoomId == request.RoomId &&
                b.Date.Date == request.Date.Date &&
                b.Status == BookingStatus.Booked &&
                (b.StartTime < request.EndTime && b.EndTime > request.StartTime),
                cancellationToken);

        if (hasOverlap)
        {
            _logger.LogWarning(
                "Room {RoomId} is already booked on {Date} between {StartTime} and {EndTime}",
                request.RoomId, request.Date.Date, request.StartTime, request.EndTime);

            // Get employee email for notification
            var employee = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.EmployeeId, cancellationToken);

            if (employee != null)
            {
                // Send conflict notification
                await _notificationService.SendBookingConflictNotificationAsync(
                    employee.Email,
                    employee.FullName,
                    room.Name,
                    request.Date,
                    request.StartTime,
                    request.EndTime);

                // Create in-app notification
                var notification = new Notification
                {
                    UserId = request.EmployeeId,
                    Title = "Booking Conflict",
                    Message = $"Room '{room.Name}' is unavailable on {request.Date:yyyy-MM-dd} from {request.StartTime:hh\\:mm} to {request.EndTime:hh\\:mm}. Please select a different time slot.",
                    Type = NotificationType.BookingConflict,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync(cancellationToken);
            }

            throw new BusinessRuleException(
                "Room is already booked for the selected time slot",
                $"Room {room.Name} has conflicting bookings");
        }

        var bookingRequest = new BookingRequest
        {
            EmployeeId = request.EmployeeId,
            EmployeeName = request.EmployeeName,
            RoomId = request.RoomId,
            Date = request.Date.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Purpose = request.Purpose,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.BookingRequests.Add(bookingRequest);
        await _context.SaveChangesAsync(cancellationToken);

        // Load room for mapping
        await _context.BookingRequests.Entry(bookingRequest)
            .Reference(b => b.Room)
            .LoadAsync(cancellationToken);

        // Send notification to admin about new booking request
        var admins = await _context.Users
            .Where(u => u.Role == UserRole.Admin)
            .ToListAsync(cancellationToken);

        foreach (var admin in admins)
        {
            await _notificationService.SendNewBookingRequestNotificationAsync(
                admin.Email,
                request.EmployeeName,
                room.Name,
                request.Date,
                request.StartTime,
                request.EndTime);

            // Create in-app notification for admin
            var adminNotification = new Notification
            {
                UserId = admin.Id,
                Title = "New Booking Request",
                Message = $"{request.EmployeeName} requested '{room.Name}' on {request.Date:yyyy-MM-dd} from {request.StartTime:hh\\:mm} to {request.EndTime:hh\\:mm}",
                Type = NotificationType.NewBookingRequest,
                BookingRequestId = bookingRequest.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(adminNotification);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Booking request {BookingId} created successfully for Employee {EmployeeId}",
            bookingRequest.Id, request.EmployeeId);

        return _mapper.Map<BookingRequestDto>(bookingRequest);
    }
}
