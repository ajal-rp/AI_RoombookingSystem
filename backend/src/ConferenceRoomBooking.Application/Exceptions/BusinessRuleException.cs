namespace ConferenceRoomBooking.Application.Exceptions;

/// <summary>
/// Exception thrown when a business rule is violated
/// </summary>
public class BusinessRuleException : Exception
{
    public string? Details { get; set; }

    public BusinessRuleException(string message)
        : base(message)
    {
    }

    public BusinessRuleException(string message, string details)
        : base(message)
    {
        Details = details;
    }
}
