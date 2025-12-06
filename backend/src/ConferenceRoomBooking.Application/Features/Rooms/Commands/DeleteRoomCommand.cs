using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Rooms.Commands;

public record DeleteRoomCommand : IRequest<bool>
{
    public int Id { get; init; }
}

public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteRoomCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .Include(r => r.BookingRequests)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (room == null)
        {
            throw new KeyNotFoundException($"Room with ID {request.Id} not found");
        }

        // Check if room has any active bookings
        var hasActiveBookings = room.BookingRequests.Any(b => 
            b.Status == BookingStatus.Booked && b.EndTime > TimeSpan.FromHours(DateTime.Now.Hour));

        if (hasActiveBookings)
        {
            throw new InvalidOperationException("Cannot delete room with active bookings");
        }

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
