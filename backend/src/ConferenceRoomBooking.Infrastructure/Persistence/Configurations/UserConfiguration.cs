using ConferenceRoomBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConferenceRoomBooking.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Primary Key
        builder.HasKey(e => e.Id);

        // Properties - keep Id as nvarchar(450) for existing data compatibility
        builder.Property(e => e.Id)
            .IsRequired();

        builder.Property(e => e.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.PasswordHash)
            .IsRequired();

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.MiddleName)
            .HasMaxLength(50);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.ProfileImageUrl)
            .HasMaxLength(500);

        builder.Property(e => e.ProfileImagePath)
            .HasMaxLength(500);

        builder.Property(e => e.Role)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.LastLoginAt);

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(e => e.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username");

        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(e => e.Role)
            .HasDatabaseName("IX_Users_Role");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_Users_IsActive");

        builder.HasIndex(e => new { e.Role, e.IsActive })
            .HasDatabaseName("IX_Users_Role_IsActive");

        // Ignore computed property
        builder.Ignore(e => e.FullName);

        // Table name
        builder.ToTable("Users");
    }
}
