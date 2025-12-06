using System.ComponentModel.DataAnnotations;

namespace ConferenceRoomBooking.Domain.Entities;

public class Room
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public string? Amenities { get; set; } // Stored as comma-separated values
    public string? ImageUrls { get; set; } // Stored as comma-separated values (optional)
    
    // Navigation property
    public ICollection<BookingRequest> BookingRequests { get; set; } = new List<BookingRequest>();
}
