using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface ISeaLionService
{
    Task<SeaLionDto> GenerateAsync(Guid userId, SeaLionGenerationOptions? options, CancellationToken ct);
    Task<SeaLionDetailDto?> GetByIdAsync(Guid id, Guid? viewerUserId, CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> GetRecentAsync(int limit, CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct);
}

public class SeaLionService(AppDbContext db, ISeaLionGenerator generator, IRatingService ratingService) : ISeaLionService
{
    public async Task<SeaLionDto> GenerateAsync(Guid userId, SeaLionGenerationOptions? options, CancellationToken ct)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == userId, ct);
        if (!userExists)
            throw new InvalidOperationException("Пользователь не найден.");

        var seaLion = new SeaLion
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Metadata = generator.Generate(options)
        };

        db.SeaLions.Add(seaLion);
        await db.SaveChangesAsync(ct);

        var user = await db.Users.AsNoTracking().FirstAsync(u => u.Id == userId, ct);
        return Map(seaLion, user.Username);
    }

    public async Task<SeaLionDetailDto?> GetByIdAsync(Guid id, Guid? viewerUserId, CancellationToken ct)
    {
        var seaLion = await db.SeaLions
            .AsNoTracking()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (seaLion is null)
            return null;

        var summary = await ratingService.GetSummaryAsync(id, viewerUserId, ct);
        var commentCount = await db.Comments.AsNoTracking().CountAsync(c => c.SeaLionId == id, ct);

        return new SeaLionDetailDto(
            seaLion.Id,
            seaLion.UserId,
            seaLion.User.Username,
            seaLion.Metadata,
            seaLion.CreatedAt,
            summary.Average,
            summary.Count,
            summary.UserRating,
            commentCount);
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetRecentAsync(int limit, CancellationToken ct)
    {
        var clampedLimit = Math.Clamp(limit, 1, 50);

        var items = await db.SeaLions
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .Take(clampedLimit)
            .Select(s => new
            {
                s.Id,
                s.UserId,
                Username = s.User.Username,
                s.Metadata,
                s.CreatedAt,
                RatingCount = s.Ratings.Count,
                CommentCount = s.Comments.Count,
                AverageRating = s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)
            })
            .ToListAsync(ct);

        return items
            .Select(s => new SeaLionDto(
                s.Id,
                s.UserId,
                s.Username,
                s.Metadata,
                s.CreatedAt,
                Math.Round(s.AverageRating, 2),
                s.RatingCount,
                s.CommentCount))
            .ToList();
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct)
    {
        var items = await db.SeaLions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.UserId,
                Username = s.User.Username,
                s.Metadata,
                s.CreatedAt,
                RatingCount = s.Ratings.Count,
                CommentCount = s.Comments.Count,
                AverageRating = s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)
            })
            .ToListAsync(ct);

        return items
            .Select(s => new SeaLionDto(
                s.Id,
                s.UserId,
                s.Username,
                s.Metadata,
                s.CreatedAt,
                Math.Round(s.AverageRating, 2),
                s.RatingCount,
                s.CommentCount))
            .ToList();
    }

    private static SeaLionDto Map(SeaLion seaLion, string username) =>
        new(seaLion.Id, seaLion.UserId, username, seaLion.Metadata, seaLion.CreatedAt);
}
