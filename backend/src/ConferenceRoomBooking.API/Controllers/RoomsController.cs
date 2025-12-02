using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Features.Rooms.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace ConferenceRoomBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RoomsController> _logger;

    public RoomsController(IMediator mediator, IMemoryCache cache, ILogger<RoomsController> logger)
    {
        _mediator = mediator;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Get all available rooms with optional filtering
    /// </summary>
    [HttpGet]
    [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "search", "minCapacity", "location" })] // Cache for 5 minutes
    public async Task<ActionResult<List<RoomDto>>> GetAllRooms(
        [FromQuery] string? search = null,
        [FromQuery] int? minCapacity = null,
        [FromQuery] string? location = null)
    {
        var cacheKey = $"rooms_{search}_{minCapacity}_{location}";
        
        if (!_cache.TryGetValue(cacheKey, out List<RoomDto>? rooms))
        {
            _logger.LogInformation("Cache miss for rooms query. Fetching from database.");
            rooms = await _mediator.Send(new GetAllRoomsQuery 
            { 
                Search = search,
                MinCapacity = minCapacity,
                Location = location
            });
            
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));
            
            _cache.Set(cacheKey, rooms, cacheOptions);
        }
        else
        {
            _logger.LogInformation("Cache hit for rooms query.");
        }
        
        return Ok(rooms);
    }

    /// <summary>
    /// Get a specific room by ID
    /// </summary>
    [HttpGet("{id}")]
    [ResponseCache(Duration = 600)] // Cache for 10 minutes
    public async Task<ActionResult<RoomDto>> GetRoomById(int id)
    {
        var cacheKey = $"room_{id}";
        
        if (!_cache.TryGetValue(cacheKey, out RoomDto? room))
        {
            room = await _mediator.Send(new GetRoomByIdQuery { Id = id });
            
            if (room == null)
            {
                return NotFound(new { message = $"Room with ID {id} not found" });
            }
            
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(10))
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            
            _cache.Set(cacheKey, room, cacheOptions);
        }
        
        return Ok(room);
    }

    /// <summary>
    /// Get room schedules with current status and bookings
    /// </summary>
    [HttpGet("schedule")]
    public async Task<ActionResult> GetRoomSchedules()
    {
        var schedules = await _mediator.Send(new GetRoomSchedulesQuery());
        return Ok(schedules);
    }
}
