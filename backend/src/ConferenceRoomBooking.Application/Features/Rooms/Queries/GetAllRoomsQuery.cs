using MediatR;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Rooms.Queries;

public record GetAllRoomsQuery : IRequest<List<RoomDto>>
{
    public string? Search { get; init; }
    public int? MinCapacity { get; init; }
    public string? Location { get; init; }
}

public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, List<RoomDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllRoomsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RoomDto>> Handle(GetAllRoomsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Rooms.AsNoTracking().AsQueryable();

        // Apply filters with optimized string comparisons
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(r => 
                EF.Functions.Like(r.Name.ToLower(), $"%{searchLower}%") || 
                (r.Description != null && EF.Functions.Like(r.Description.ToLower(), $"%{searchLower}%")) ||
                (r.Location != null && EF.Functions.Like(r.Location.ToLower(), $"%{searchLower}%")));
        }

        if (request.MinCapacity.HasValue)
        {
            query = query.Where(r => r.Capacity >= request.MinCapacity.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var locationLower = request.Location.ToLower();
            query = query.Where(r => r.Location != null && EF.Functions.Like(r.Location.ToLower(), $"%{locationLower}%"));
        }

        var rooms = await query
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
            
        return _mapper.Map<List<RoomDto>>(rooms);
    }
}
