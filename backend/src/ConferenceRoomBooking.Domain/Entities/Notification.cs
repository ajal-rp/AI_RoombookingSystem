using System.ComponentModel.DataAnnotations;

namespace ConferenceRoomBooking.Domain.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public int? BookingRequestId { get; set; }
}

public enum NotificationType
{
    BookingConflict,
    BookingConfirmed,
    BookingRejected,
    NewBookingRequest,
    BookingReminder,
    System
}
