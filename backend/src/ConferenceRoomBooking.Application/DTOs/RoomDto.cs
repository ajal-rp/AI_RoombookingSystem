namespace ConferenceRoomBooking.Application.DTOs;

public class RoomDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public List<string> Amenities { get; set; } = new();
}

public class RoomScheduleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public List<BookingInfoDto> Bookings { get; set; } = new();
}

public class BookingInfoDto
{
    public string EmployeeName { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
}
