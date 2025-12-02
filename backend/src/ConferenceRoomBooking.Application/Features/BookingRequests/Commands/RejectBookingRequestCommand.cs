using MediatR;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Application.Exceptions;
using ConferenceRoomBooking.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Commands;

public record RejectBookingRequestCommand : IRequest<bool>
{
    public int Id { get; init; }
    public string? RejectReason { get; init; }
}

public class RejectBookingRequestCommandHandler : IRequestHandler<RejectBookingRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<RejectBookingRequestCommandHandler> _logger;
    private readonly INotificationService _notificationService;

    public RejectBookingRequestCommandHandler(
        IApplicationDbContext context,
        ILogger<RejectBookingRequestCommandHandler> logger,
        INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(RejectBookingRequestCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Attempting to reject booking request {BookingId} with reason: {Reason}",
            request.Id, request.RejectReason ?? "No reason provided");

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
                "Cannot reject booking request {BookingId} with status {Status}",
                request.Id, bookingRequest.Status);
            throw new BusinessRuleException(
                "Only pending requests can be rejected",
                $"Current status: {bookingRequest.Status}");
        }

        bookingRequest.Status = BookingStatus.Rejected;
        bookingRequest.RejectReason = request.RejectReason;
        await _context.SaveChangesAsync(cancellationToken);

        // Get employee and room details for notification
        var employee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == bookingRequest.EmployeeId, cancellationToken);
        
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == bookingRequest.RoomId, cancellationToken);

        if (employee != null && room != null)
        {
            // Send rejection notification
            await _notificationService.SendBookingRejectedNotificationAsync(
                employee.Email,
                employee.FullName,
                room.Name,
                bookingRequest.Date,
                bookingRequest.StartTime,
                bookingRequest.EndTime,
                request.RejectReason);

            // Create in-app notification
            var notification = new Notification
            {
                UserId = bookingRequest.EmployeeId,
                Title = "Booking Rejected",
                Message = $"Your booking for '{room.Name}' on {bookingRequest.Date:yyyy-MM-dd} from {bookingRequest.StartTime:hh\\:mm} to {bookingRequest.EndTime:hh\\:mm} was declined.{(string.IsNullOrEmpty(request.RejectReason) ? "" : $" Reason: {request.RejectReason}")}",
                Type = NotificationType.BookingRejected,
                BookingRequestId = bookingRequest.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "Booking request {BookingId} rejected successfully. Reason: {Reason}",
            request.Id, request.RejectReason ?? "None");

        return true;
    }
}
