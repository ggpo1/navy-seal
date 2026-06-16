using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NavySeal.API.Models;

namespace NavySeal.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
  private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

  public DbSet<User> Users => Set<User>();
  public DbSet<SeaLion> SeaLions => Set<SeaLion>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    var metadataConverter = new ValueConverter<SeaLionMetadata, string>(
      v => JsonSerializer.Serialize(v, JsonOptions),
      v => JsonSerializer.Deserialize<SeaLionMetadata>(v, JsonOptions) ?? new SeaLionMetadata());

    var metadataComparer = new ValueComparer<SeaLionMetadata>(
      (a, b) => JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions),
      v => JsonSerializer.Serialize(v, JsonOptions).GetHashCode(),
      v => JsonSerializer.Deserialize<SeaLionMetadata>(JsonSerializer.Serialize(v, JsonOptions), JsonOptions)!);

    modelBuilder.Entity<User>(entity =>
    {
      entity.HasKey(u => u.Id);
      entity.HasIndex(u => u.Username).IsUnique();
      entity.HasIndex(u => u.Email).IsUnique();
      entity.Property(u => u.Username).HasMaxLength(64);
      entity.Property(u => u.Email).HasMaxLength(256);
    });

    modelBuilder.Entity<SeaLion>(entity =>
    {
      entity.HasKey(s => s.Id);
      entity.HasIndex(s => s.CreatedAt);
      entity.HasIndex(s => s.UserId);
      entity.Property(s => s.Metadata)
        .HasColumnType("jsonb")
        .HasConversion(metadataConverter, metadataComparer);
      entity.HasOne(s => s.User)
        .WithMany(u => u.SeaLions)
        .HasForeignKey(s => s.UserId)
        .OnDelete(DeleteBehavior.Cascade);
    });
  }
}
