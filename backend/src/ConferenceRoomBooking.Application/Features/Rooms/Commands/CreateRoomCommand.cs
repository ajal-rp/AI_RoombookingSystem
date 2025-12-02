using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using ConferenceRoomBooking.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Rooms.Commands;

public record CreateRoomCommand : IRequest<RoomDto>
{
    public string Name { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string? Description { get; init; }
    public List<string> Amenities { get; init; } = new();
}

public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Room name is required")
            .MaximumLength(100).WithMessage("Room name cannot exceed 100 characters");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacity must be greater than 0")
            .LessThanOrEqualTo(1000).WithMessage("Capacity cannot exceed 1000");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, RoomDto>
{
    private readonly IApplicationDbContext _context;

    public CreateRoomCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RoomDto> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        // Check if room with same name already exists
        var existingRoom = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Name.ToLower() == request.Name.ToLower(), cancellationToken);

        if (existingRoom != null)
        {
            throw new InvalidOperationException($"A room with the name '{request.Name}' already exists");
        }

        var room = new Room
        {
            Name = request.Name,
            Location = request.Location,
            Capacity = request.Capacity,
            Description = request.Description,
            Amenities = request.Amenities.Any() ? string.Join(",", request.Amenities) : null
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Location = room.Location,
            Capacity = room.Capacity,
            Description = room.Description,
            Amenities = room.Amenities?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>()
        };
    }
}
