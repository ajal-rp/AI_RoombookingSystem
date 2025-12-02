using MediatR;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Queries;

public record CheckRoomAvailabilityQuery : IRequest<bool>
{
    public int RoomId { get; init; }
    public DateTime Date { get; init; }
    public TimeSpan StartTime { get; init; }
    public TimeSpan EndTime { get; init; }
}

public class CheckRoomAvailabilityQueryHandler : IRequestHandler<CheckRoomAvailabilityQuery, bool>
{
    private readonly IApplicationDbContext _context;

    public CheckRoomAvailabilityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(CheckRoomAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var hasOverlap = await _context.BookingRequests
            .AnyAsync(b => 
                b.RoomId == request.RoomId &&
                b.Date.Date == request.Date.Date &&
                b.Status == BookingStatus.Booked &&
                (b.StartTime < request.EndTime && b.EndTime > request.StartTime),
                cancellationToken);

        return !hasOverlap; // Return true if available (no overlap)
    }
}
