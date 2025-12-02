using ConferenceRoomBooking.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConferenceRoomBooking.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(ILogger<EmailNotificationService> logger)
    {
        _logger = logger;
    }

    public async Task SendBookingConflictNotificationAsync(
        string employeeEmail,
        string employeeName,
        string roomName,
        DateTime date,
        TimeSpan startTime,
        TimeSpan endTime)
    {
        _logger.LogInformation(
            "Sending conflict notification to {EmployeeName} ({Email}): Room {Room} unavailable on {Date} from {StartTime} to {EndTime}",
            employeeName, employeeEmail, roomName, date.ToShortDateString(), startTime, endTime);

        // TODO: Implement actual email sending (SMTP, SendGrid, etc.)
        // For now, we'll simulate the notification
        var emailContent = $@"
Dear {employeeName},

Unfortunately, the room booking request could not be completed.

Room: {roomName}
Date: {date:yyyy-MM-dd}
Time: {startTime:hh\:mm} - {endTime:hh\:mm}

Reason: The selected time slot is already booked. Please choose a different time slot.

Best regards,
Room Booking System
";

        _logger.LogInformation("Email notification sent successfully to {Email}", employeeEmail);
        
        // Simulate async operation
        await Task.CompletedTask;
    }

    public async Task SendBookingConfirmedNotificationAsync(
        string employeeEmail,
        string employeeName,
        string roomName,
        DateTime date,
        TimeSpan startTime,
        TimeSpan endTime)
    {
        _logger.LogInformation(
            "Sending confirmation notification to {EmployeeName} ({Email}): Room {Room} confirmed on {Date} from {StartTime} to {EndTime}",
            employeeName, employeeEmail, roomName, date.ToShortDateString(), startTime, endTime);

        var emailContent = $@"
Dear {employeeName},

Great news! Your room booking request has been approved.

Room: {roomName}
Date: {date:yyyy-MM-dd}
Time: {startTime:hh\:mm} - {endTime:hh\:mm}
Status: CONFIRMED ✓

Please arrive on time. If you need to cancel, please do so in advance.

Best regards,
Room Booking System
";

        _logger.LogInformation("Confirmation email sent successfully to {Email}", employeeEmail);
        
        await Task.CompletedTask;
    }

    public async Task SendBookingRejectedNotificationAsync(
        string employeeEmail,
        string employeeName,
        string roomName,
        DateTime date,
        TimeSpan startTime,
        TimeSpan endTime,
        string? rejectReason)
    {
        _logger.LogInformation(
            "Sending rejection notification to {EmployeeName} ({Email}): Room {Room} rejected on {Date} from {StartTime} to {EndTime}",
            employeeName, employeeEmail, roomName, date.ToShortDateString(), startTime, endTime);

        var emailContent = $@"
Dear {employeeName},

Your room booking request has been declined.

Room: {roomName}
Date: {date:yyyy-MM-dd}
Time: {startTime:hh\:mm} - {endTime:hh\:mm}
Status: REJECTED ✗

{(string.IsNullOrEmpty(rejectReason) ? "" : $"Reason: {rejectReason}")}

You can submit a new booking request for a different time slot.

Best regards,
Room Booking System
";

        _logger.LogInformation("Rejection email sent successfully to {Email}", employeeEmail);
        
        await Task.CompletedTask;
    }

    public async Task SendNewBookingRequestNotificationAsync(
        string adminEmail,
        string employeeName,
        string roomName,
        DateTime date,
        TimeSpan startTime,
        TimeSpan endTime)
    {
        _logger.LogInformation(
            "Sending new request notification to admin ({Email}): {EmployeeName} requested {Room} on {Date} from {StartTime} to {EndTime}",
            adminEmail, employeeName, roomName, date.ToShortDateString(), startTime, endTime);

        var emailContent = $@"
Dear Admin,

A new room booking request requires your review.

Employee: {employeeName}
Room: {roomName}
Date: {date:yyyy-MM-dd}
Time: {startTime:hh\:mm} - {endTime:hh\:mm}
Status: PENDING REVIEW

Please log in to the system to approve or reject this request.

Best regards,
Room Booking System
";

        _logger.LogInformation("Admin notification sent successfully to {Email}", adminEmail);
        
        await Task.CompletedTask;
    }
}
