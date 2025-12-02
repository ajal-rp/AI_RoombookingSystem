using FluentValidation;
using ConferenceRoomBooking.Application.Features.BookingRequests.Commands;

namespace ConferenceRoomBooking.Application.Validators;

public class CreateBookingRequestCommandValidator : AbstractValidator<CreateBookingRequestCommand>
{
    public CreateBookingRequestCommandValidator()
    {
        // Note: EmployeeId and EmployeeName are set by the controller from JWT token
        // so we don't validate them here

        RuleFor(x => x.RoomId)
            .GreaterThan(0)
            .WithMessage("Please select a valid room");

        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Meeting purpose is required")
            .MinimumLength(10)
            .WithMessage("Purpose must be at least 10 characters")
            .MaximumLength(500)
            .WithMessage("Purpose cannot exceed 500 characters");

        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("Booking date is required")
            .Must(BeValidDate)
            .WithMessage("Booking date must be today or in the future")
            .Must(BeWithinSixMonths)
            .WithMessage("Bookings can only be made up to 6 months in advance");

        RuleFor(x => x.StartTime)
            .NotEmpty()
            .WithMessage("Start time is required")
            .Must(BeValidBusinessHours)
            .WithMessage("Start time must be between 8:00 AM and 6:00 PM")
            .Must(BeOnHourOrHalfHour)
            .WithMessage("Start time must be on the hour or half hour (e.g., 9:00, 9:30)");

        RuleFor(x => x.EndTime)
            .NotEmpty()
            .WithMessage("End time is required")
            .Must(BeValidBusinessHours)
            .WithMessage("End time must be between 8:00 AM and 6:00 PM")
            .GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time");

        RuleFor(x => x)
            .Must(x => (x.EndTime - x.StartTime).TotalMinutes >= 30)
            .WithMessage("Booking must be at least 30 minutes long")
            .Must(x => (x.EndTime - x.StartTime).TotalHours <= 8)
            .WithMessage("Booking cannot exceed 8 hours");
    }

    private static bool BeValidDate(DateTime date)
    {
        return date.Date >= DateTime.Today;
    }

    private static bool BeWithinSixMonths(DateTime date)
    {
        return date.Date <= DateTime.Today.AddMonths(6);
    }

    private static bool BeValidBusinessHours(TimeSpan time)
    {
        var hours = time.Hours + time.Minutes / 60.0;
        return hours >= 8 && hours <= 18; // 8 AM to 6 PM
    }

    private static bool BeOnHourOrHalfHour(TimeSpan time)
    {
        return time.Minutes == 0 || time.Minutes == 30;
    }
}
