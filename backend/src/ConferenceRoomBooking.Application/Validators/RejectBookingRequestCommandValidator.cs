using FluentValidation;
using ConferenceRoomBooking.Application.Features.BookingRequests.Commands;

namespace ConferenceRoomBooking.Application.Validators;

public class RejectBookingRequestCommandValidator : AbstractValidator<RejectBookingRequestCommand>
{
    public RejectBookingRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Invalid booking request ID");

        RuleFor(x => x.RejectReason)
            .NotEmpty()
            .WithMessage("Rejection reason is required")
            .MinimumLength(10)
            .WithMessage("Rejection reason must be at least 10 characters")
            .MaximumLength(500)
            .WithMessage("Rejection reason cannot exceed 500 characters");
    }
}
