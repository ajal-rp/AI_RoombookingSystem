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
        var query = _context.Rooms.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(r => 
                r.Name.Contains(request.Search) || 
                (r.Description != null && r.Description.Contains(request.Search)) ||
                (r.Location != null && r.Location.Contains(request.Search)));
        }

        if (request.MinCapacity.HasValue)
        {
            query = query.Where(r => r.Capacity >= request.MinCapacity.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            query = query.Where(r => r.Location != null && r.Location.Contains(request.Location));
        }

        var rooms = await query
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
            
        return _mapper.Map<List<RoomDto>>(rooms);
    }
}
