namespace ConferenceRoomBooking.Application.Interfaces;

public interface INotificationService
{
    Task SendBookingConflictNotificationAsync(
        string employeeEmail, 
        string employeeName, 
        string roomName, 
        DateTime date, 
        TimeSpan startTime, 
        TimeSpan endTime);

    Task SendBookingConfirmedNotificationAsync(
        string employeeEmail, 
        string employeeName, 
        string roomName, 
        DateTime date, 
        TimeSpan startTime, 
        TimeSpan endTime);

    Task SendBookingRejectedNotificationAsync(
        string employeeEmail, 
        string employeeName, 
        string roomName, 
        DateTime date, 
        TimeSpan startTime, 
        TimeSpan endTime,
        string? rejectReason);

    Task SendNewBookingRequestNotificationAsync(
        string adminEmail,
        string employeeName,
        string roomName,
        DateTime date,
        TimeSpan startTime,
        TimeSpan endTime);
}
