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
  public DbSet<Comment> Comments => Set<Comment>();
  public DbSet<Rating> Ratings => Set<Rating>();
  public DbSet<DailyContest> DailyContests => Set<DailyContest>();
  public DbSet<ContestVote> ContestVotes => Set<ContestVote>();

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

    modelBuilder.Entity<Comment>(entity =>
    {
      entity.HasKey(c => c.Id);
      entity.HasIndex(c => c.SeaLionId);
      entity.HasIndex(c => new { c.SeaLionId, c.CreatedAt });
      entity.Property(c => c.Text).HasMaxLength(1000);
      entity.HasOne(c => c.SeaLion)
        .WithMany(s => s.Comments)
        .HasForeignKey(c => c.SeaLionId)
        .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(c => c.User)
        .WithMany(u => u.Comments)
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Cascade);
    });

    modelBuilder.Entity<Rating>(entity =>
    {
      entity.HasKey(r => r.Id);
      entity.HasIndex(r => new { r.UserId, r.SeaLionId }).IsUnique();
      entity.HasIndex(r => r.SeaLionId);
      entity.HasOne(r => r.SeaLion)
        .WithMany(s => s.Ratings)
        .HasForeignKey(r => r.SeaLionId)
        .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(r => r.User)
        .WithMany(u => u.Ratings)
        .HasForeignKey(r => r.UserId)
        .OnDelete(DeleteBehavior.Cascade);
    });

    modelBuilder.Entity<DailyContest>(entity =>
    {
      entity.HasKey(c => c.Id);
      entity.HasIndex(c => c.PeriodStartUtc).IsUnique();
      entity.HasIndex(c => new { c.FinalizedAt, c.PeriodEndUtc });
      entity.Property(c => c.Nomination).HasMaxLength(64);
      entity.HasOne(c => c.WinnerSeaLion)
        .WithMany()
        .HasForeignKey(c => c.WinnerSeaLionId)
        .OnDelete(DeleteBehavior.SetNull);
    });

    modelBuilder.Entity<ContestVote>(entity =>
    {
      entity.HasKey(v => v.Id);
      entity.HasIndex(v => new { v.ContestId, v.UserId }).IsUnique();
      entity.HasIndex(v => v.SeaLionId);
      entity.HasOne(v => v.Contest)
        .WithMany(c => c.Votes)
        .HasForeignKey(v => v.ContestId)
        .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(v => v.User)
        .WithMany(u => u.ContestVotes)
        .HasForeignKey(v => v.UserId)
        .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(v => v.SeaLion)
        .WithMany(s => s.ContestVotes)
        .HasForeignKey(v => v.SeaLionId)
        .OnDelete(DeleteBehavior.Cascade);
    });
  }
}
