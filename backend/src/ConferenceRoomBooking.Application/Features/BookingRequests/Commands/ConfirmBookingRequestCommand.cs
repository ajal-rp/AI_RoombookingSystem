using MediatR;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Application.Exceptions;
using ConferenceRoomBooking.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Commands;

public record ConfirmBookingRequestCommand : IRequest<bool>
{
    public int Id { get; init; }
}

public class ConfirmBookingRequestCommandHandler : IRequestHandler<ConfirmBookingRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ConfirmBookingRequestCommandHandler> _logger;
    private readonly INotificationService _notificationService;

    public ConfirmBookingRequestCommandHandler(
        IApplicationDbContext context,
        ILogger<ConfirmBookingRequestCommandHandler> logger,
        INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(ConfirmBookingRequestCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to confirm booking request {BookingId}", request.Id);

        var bookingRequest = await _context.BookingRequests
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

        if (bookingRequest == null)
        {
            _logger.LogWarning("Booking request {BookingId} not found", request.Id);
            throw new NotFoundException("BookingRequest", request.Id);
        }

        if (bookingRequest.Status != BookingStatus.Pending)
        {
            _logger.LogWarning(
                "Cannot confirm booking request {BookingId} with status {Status}",
                request.Id, bookingRequest.Status);
            throw new BusinessRuleException(
                "Only pending requests can be confirmed",
                $"Current status: {bookingRequest.Status}");
        }

        // Double-check for overlaps before confirming - optimized query
        var normalizedDate = bookingRequest.Date;
        var hasOverlap = await _context.BookingRequests
            .AsNoTracking()
            .Where(b => 
                b.Id != request.Id &&
                b.RoomId == bookingRequest.RoomId &&
                b.Date == normalizedDate &&
                b.Status == BookingStatus.Booked)
            .AnyAsync(b => b.StartTime < bookingRequest.EndTime && b.EndTime > bookingRequest.StartTime,
                cancellationToken);

        if (hasOverlap)
        {
            _logger.LogWarning(
                "Cannot confirm booking request {BookingId} - Room {RoomId} has overlapping booking",
                request.Id, bookingRequest.RoomId);
            throw new BusinessRuleException(
                "Room is already booked for this time slot",
                "Another booking was confirmed for the same room and time");
        }

        bookingRequest.Status = BookingStatus.Booked;
        await _context.SaveChangesAsync(cancellationToken);

        // Get employee and room details in parallel for notification
        var employeeTask = _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == bookingRequest.EmployeeId, cancellationToken);
        
        var roomTask = _context.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == bookingRequest.RoomId, cancellationToken);

        await Task.WhenAll(employeeTask, roomTask);
        var employee = await employeeTask;
        var room = await roomTask;

        if (employee != null && room != null)
        {
            // Send confirmation notification
            await _notificationService.SendBookingConfirmedNotificationAsync(
                employee.Email,
                employee.FullName,
                room.Name,
                bookingRequest.Date,
                bookingRequest.StartTime,
                bookingRequest.EndTime);

            // Create in-app notification
            var notification = new Notification
            {
                UserId = bookingRequest.EmployeeId,
                Title = "Booking Confirmed",
                Message = $"Your booking for '{room.Name}' on {bookingRequest.Date:yyyy-MM-dd} from {bookingRequest.StartTime:hh\\:mm} to {bookingRequest.EndTime:hh\\:mm} has been approved.",
                Type = NotificationType.BookingConfirmed,
                BookingRequestId = bookingRequest.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "Booking request {BookingId} confirmed successfully for Room {RoomId} on {Date}",
            request.Id, bookingRequest.RoomId, bookingRequest.Date);

        return true;
    }
}
