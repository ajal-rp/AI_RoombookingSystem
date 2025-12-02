using System.ComponentModel.DataAnnotations;

namespace ConferenceRoomBooking.Domain.Entities;

public class BookingRequest
{
    [Key]
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? RejectReason { get; set; }
    
    // Navigation property
    public Room Room { get; set; } = null!;
}

public enum BookingStatus
{
    Pending,
    Booked,
    Rejected
}
