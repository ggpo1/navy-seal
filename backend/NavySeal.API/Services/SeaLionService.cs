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
    Task<IReadOnlyList<SeaLionDto>> GetTopAsync(string period, int limit, int minRatings, CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct);
}

public class SeaLionService(
    AppDbContext db,
    ISeaLionGenerator generator,
    IRatingService ratingService,
    IBadgeService badgeService) : ISeaLionService
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
        var dto = Map(seaLion, user.Username);
        var enriched = await badgeService.ApplySealBadgesAsync([dto], ct);
        return enriched[0];
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
            .Select(s => new SeaLionListRow(
                s.Id,
                s.UserId,
                s.User.Username,
                s.Metadata,
                s.CreatedAt,
                s.Ratings.Count,
                s.Comments.Count,
                s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)))
            .ToListAsync(ct);

        return await ToDtoListAsync(items, ct);
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetTopAsync(
        string period,
        int limit,
        int minRatings,
        CancellationToken ct)
    {
        if (!SeaLionTopPeriods.IsValid(period))
            throw new ArgumentException("Период должен быть week или all.");

        var clampedLimit = Math.Clamp(limit, 1, 50);
        var minRatingsClamped = Math.Clamp(minRatings, 1, 20);
        var normalizedPeriod = period.ToLowerInvariant();

        var query = db.SeaLions.AsNoTracking().AsQueryable();

        if (normalizedPeriod == SeaLionTopPeriods.Week)
        {
            var since = DateTime.UtcNow.AddDays(-7);
            query = query.Where(s => s.CreatedAt >= since);
        }

        var items = await query
            .Where(s => s.Ratings.Count >= minRatingsClamped)
            .OrderByDescending(s => s.Ratings.Average(r => (double)r.Value))
            .ThenByDescending(s => s.Ratings.Count)
            .ThenByDescending(s => s.CreatedAt)
            .Take(clampedLimit)
            .Select(s => new SeaLionListRow(
                s.Id,
                s.UserId,
                s.User.Username,
                s.Metadata,
                s.CreatedAt,
                s.Ratings.Count,
                s.Comments.Count,
                s.Ratings.Average(r => (double)r.Value)))
            .ToListAsync(ct);

        return await ToDtoListAsync(items, ct);
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct)
    {
        var items = await db.SeaLions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SeaLionListRow(
                s.Id,
                s.UserId,
                s.User.Username,
                s.Metadata,
                s.CreatedAt,
                s.Ratings.Count,
                s.Comments.Count,
                s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)))
            .ToListAsync(ct);

        return await ToDtoListAsync(items, ct);
    }

    private async Task<IReadOnlyList<SeaLionDto>> ToDtoListAsync(
        IReadOnlyList<SeaLionListRow> items,
        CancellationToken ct)
    {
        var dtos = items
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

        return await badgeService.ApplySealBadgesAsync(dtos, ct);
    }

    private sealed record SeaLionListRow(
        Guid Id,
        Guid UserId,
        string Username,
        SeaLionMetadata Metadata,
        DateTime CreatedAt,
        int RatingCount,
        int CommentCount,
        double AverageRating);

    private static SeaLionDto Map(SeaLion seaLion, string username) =>
        new(seaLion.Id, seaLion.UserId, username, seaLion.Metadata, seaLion.CreatedAt);
}
