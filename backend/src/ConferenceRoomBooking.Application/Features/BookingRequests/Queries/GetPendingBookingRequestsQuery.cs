using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;
using AutoMapper;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Queries;

public record GetPendingBookingRequestsQuery : IRequest<List<BookingRequestDto>>;

public class GetPendingBookingRequestsQueryHandler : IRequestHandler<GetPendingBookingRequestsQuery, List<BookingRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPendingBookingRequestsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<BookingRequestDto>> Handle(GetPendingBookingRequestsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _context.BookingRequests
            .Include(b => b.Room)
            .Where(b => b.Status == BookingStatus.Pending)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<BookingRequestDto>>(bookings);
    }
}
