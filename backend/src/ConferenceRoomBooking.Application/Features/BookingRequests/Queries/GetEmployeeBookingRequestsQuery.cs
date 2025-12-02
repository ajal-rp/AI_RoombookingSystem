using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using AutoMapper;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Queries;

public record GetEmployeeBookingRequestsQuery : IRequest<List<BookingRequestDto>>
{
    public string EmployeeId { get; init; } = string.Empty;
}

public class GetEmployeeBookingRequestsQueryHandler : IRequestHandler<GetEmployeeBookingRequestsQuery, List<BookingRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetEmployeeBookingRequestsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<BookingRequestDto>> Handle(GetEmployeeBookingRequestsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _context.BookingRequests
            .Include(b => b.Room)
            .Where(b => b.EmployeeId == request.EmployeeId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<BookingRequestDto>>(bookings);
    }
}
