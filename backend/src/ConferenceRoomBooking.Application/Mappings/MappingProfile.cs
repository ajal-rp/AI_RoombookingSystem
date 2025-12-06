using AutoMapper;
using ConferenceRoomBooking.Application.DTOs;
using ConferenceRoomBooking.Domain.Entities;

namespace ConferenceRoomBooking.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Room, RoomDto>()
            .ForMember(dest => dest.Amenities, opt => opt.MapFrom(src => 
                !string.IsNullOrWhiteSpace(src.Amenities) 
                    ? src.Amenities.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList()
                    : new List<string>()))
            .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => 
                !string.IsNullOrWhiteSpace(src.ImageUrls) 
                    ? src.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList()
                    : new List<string>()));
                    
        CreateMap<BookingRequest, BookingRequestDto>()
            .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Room.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
