using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ConferenceRoomBooking.Application.Features.Rooms.Commands;

public record UpdateRoomCommand : IRequest<RoomDto>
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public string? Description { get; init; }
    public List<string> Amenities { get; init; } = new();
    public List<string>? ImageUrls { get; init; }
}

public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Room ID is required");

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

public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, RoomDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateRoomCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RoomDto> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (room == null)
        {
            throw new KeyNotFoundException($"Room with ID {request.Id} not found");
        }

        // Check if another room with same name exists
        var existingRoom = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Name.ToLower() == request.Name.ToLower() && r.Id != request.Id, cancellationToken);

        if (existingRoom != null)
        {
            throw new InvalidOperationException($"A room with the name '{request.Name}' already exists");
        }

        room.Name = request.Name;
        room.Location = request.Location;
        room.Capacity = request.Capacity;
        room.Description = request.Description;
        room.Amenities = request.Amenities.Any() ? string.Join(",", request.Amenities) : null;
        room.ImageUrls = request.ImageUrls?.Any() == true ? string.Join(",", request.ImageUrls) : null;

        await _context.SaveChangesAsync(cancellationToken);

        return new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Location = room.Location,
            Capacity = room.Capacity,
            Description = room.Description,
            Amenities = room.Amenities?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            ImageUrls = room.ImageUrls?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>()
        };
    }
}
