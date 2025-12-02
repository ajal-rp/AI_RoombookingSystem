using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.BookingRequests.Queries;

public record GetAllBookingRequestsQuery : IRequest<object>
{
    public string? Status { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

public class GetAllBookingRequestsQueryHandler : IRequestHandler<GetAllBookingRequestsQuery, object>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllBookingRequestsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<object> Handle(GetAllBookingRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BookingRequests
            .Include(br => br.Room)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<Domain.Entities.BookingStatus>(request.Status, true, out var statusEnum))
            {
                query = query.Where(br => br.Status == statusEnum);
            }
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(br => br.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(br => br.Date <= request.EndDate.Value);
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var bookingRequests = await query
            .OrderByDescending(br => br.Date)
            .ThenByDescending(br => br.StartTime)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<BookingRequestDto>>(bookingRequests);

        return new
        {
            data = dtos,
            totalCount,
            page = request.Page,
            pageSize = request.PageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
