using ConferenceRoomBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConferenceRoomBooking.Infrastructure.Persistence.Configurations;

public class BookingRequestConfiguration : IEntityTypeConfiguration<BookingRequest>
{
    public void Configure(EntityTypeBuilder<BookingRequest> builder)
    {
        // Primary Key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.EmployeeId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.EmployeeName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.RoomId)
            .IsRequired();

        builder.Property(e => e.Date)
            .IsRequired();

        builder.Property(e => e.StartTime)
            .IsRequired();

        builder.Property(e => e.EndTime)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.RejectReason)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(e => e.EmployeeId)
            .HasDatabaseName("IX_BookingRequests_EmployeeId");

        builder.HasIndex(e => e.RoomId)
            .HasDatabaseName("IX_BookingRequests_RoomId");

        builder.HasIndex(e => e.Date)
            .HasDatabaseName("IX_BookingRequests_Date");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_BookingRequests_Status");

        builder.HasIndex(e => new { e.RoomId, e.Date, e.Status })
            .HasDatabaseName("IX_BookingRequests_RoomId_Date_Status");

        builder.HasIndex(e => new { e.EmployeeId, e.Status })
            .HasDatabaseName("IX_BookingRequests_EmployeeId_Status");

        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_BookingRequests_CreatedAt");

        // Relationships
        builder.HasOne(e => e.Room)
            .WithMany(r => r.BookingRequests)
            .HasForeignKey(e => e.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // Table name
        builder.ToTable("BookingRequests");
    }
}
