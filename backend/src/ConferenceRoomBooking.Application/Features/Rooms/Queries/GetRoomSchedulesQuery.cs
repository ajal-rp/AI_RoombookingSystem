using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Rooms.Queries;

public class GetRoomSchedulesQuery : IRequest<List<RoomScheduleDto>>
{
}

public class GetRoomSchedulesQueryHandler : IRequestHandler<GetRoomSchedulesQuery, List<RoomScheduleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomSchedulesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RoomScheduleDto>> Handle(GetRoomSchedulesQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _context.Rooms.ToListAsync(cancellationToken);
        var today = DateTime.Today.Date;
        
        var todayBookings = await _context.BookingRequests
            .Where(b => b.Date.Date == today && b.Status == BookingStatus.Booked)
            .OrderBy(b => b.StartTime)
            .ToListAsync(cancellationToken);

        var schedules = new List<RoomScheduleDto>();

        foreach (var room in rooms)
        {
            var roomBookings = todayBookings
                .Where(b => b.RoomId == room.Id)
                .Select(b => new BookingInfoDto
                {
                    EmployeeName = b.EmployeeName,
                    StartTime = b.StartTime.ToString(@"hh\:mm\:ss"),
                    EndTime = b.EndTime.ToString(@"hh\:mm\:ss"),
                    Purpose = b.Purpose
                })
                .ToList();

            schedules.Add(new RoomScheduleDto
            {
                Id = room.Id,
                Name = room.Name,
                Location = room.Location,
                Capacity = room.Capacity,
                Bookings = roomBookings
            });
        }

        return schedules;
    }
}
