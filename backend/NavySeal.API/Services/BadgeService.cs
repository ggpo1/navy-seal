using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public record UserBadgeData(
    int SealCount,
    int LegendaryCount,
    int CommentsReceived,
    int RatingsReceived,
    int CommentsGiven,
    int RatingsGiven,
    Guid? FirstSealId,
    bool HasPopularSeal,
    bool HasTopWeekSeal,
    bool HasHallOfFameSeal)
{
    public static UserBadgeData Empty { get; } = new(0, 0, 0, 0, 0, 0, null, false, false, false);
}

public static class BadgeResolver
{
    public static IReadOnlyList<string> ForUser(UserBadgeData data)
    {
        var badges = new List<string>(BadgeIds.DisplayOrder.Length);
        if (data.SealCount >= 1)
            badges.Add(BadgeIds.FirstSeal);
        AppendUserBadges(badges, data);
        if (data.HasTopWeekSeal)
            badges.Add(BadgeIds.TopWeek);
        if (data.HasHallOfFameSeal)
            badges.Add(BadgeIds.HallOfFame);
        if (data.HasPopularSeal)
            badges.Add(BadgeIds.PopularSeal);
        return Sort(badges);
    }

    public static IReadOnlyList<string> ForSeal(
        UserBadgeData data,
        Guid sealId,
        double averageRating,
        int ratingCount,
        IReadOnlySet<Guid> topWeekSealIds,
        IReadOnlySet<Guid> hallOfFameSealIds)
    {
        var badges = new List<string>(BadgeIds.DisplayOrder.Length);
        AppendUserBadges(badges, data);

        if (data.FirstSealId == sealId)
            badges.Add(BadgeIds.FirstSeal);

        if (BadgeRules.IsPopularSeal(averageRating, ratingCount))
            badges.Add(BadgeIds.PopularSeal);

        if (topWeekSealIds.Contains(sealId))
            badges.Add(BadgeIds.TopWeek);

        if (hallOfFameSealIds.Contains(sealId))
            badges.Add(BadgeIds.HallOfFame);

        return Sort(badges);
    }

    private static void AppendUserBadges(List<string> badges, UserBadgeData data)
    {
        if (data.SealCount >= 5)
            badges.Add(BadgeIds.Seals5);
        if (data.SealCount >= 25)
            badges.Add(BadgeIds.Seals25);
        if (data.LegendaryCount >= 1)
            badges.Add(BadgeIds.FirstLegendary);
        if (data.LegendaryCount >= 10)
            badges.Add(BadgeIds.Legendary10);
        if (data.CommentsReceived >= 100)
            badges.Add(BadgeIds.Comments100);
        if (data.RatingsReceived >= 50)
            badges.Add(BadgeIds.Ratings50);
        if (data.CommentsGiven >= 25)
            badges.Add(BadgeIds.Commenter25);
        if (data.RatingsGiven >= 50)
            badges.Add(BadgeIds.Critic50);
    }

    private static IReadOnlyList<string> Sort(IReadOnlyList<string> badges)
    {
        var set = badges.ToHashSet(StringComparer.Ordinal);
        return BadgeIds.DisplayOrder.Where(set.Contains).ToList();
    }
}

public interface IBadgeService
{
    Task<UserBadgeData> GetUserDataAsync(Guid userId, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, UserBadgeData>> GetBatchAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> ApplySealBadgesAsync(
        IReadOnlyList<SeaLionDto> items,
        CancellationToken ct);
}

public class BadgeService(AppDbContext db) : IBadgeService
{
    public async Task<UserBadgeData> GetUserDataAsync(Guid userId, CancellationToken ct)
    {
        var batch = await GetBatchAsync([userId], ct);
        return batch.GetValueOrDefault(userId, UserBadgeData.Empty);
    }

    public async Task<IReadOnlyDictionary<Guid, UserBadgeData>> GetBatchAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken ct)
    {
        if (userIds.Count == 0)
            return new Dictionary<Guid, UserBadgeData>();

        var distinctIds = userIds.Distinct().ToList();
        var topWeekSealIds = await GetTopSealIdsAsync(SeaLionTopPeriods.Week, ct);
        var hallOfFameSealIds = await GetTopSealIdsAsync(SeaLionTopPeriods.All, ct);

        var sealRows = await db.SeaLions
            .AsNoTracking()
            .Where(s => distinctIds.Contains(s.UserId))
            .Select(s => new
            {
                s.Id,
                s.UserId,
                s.CreatedAt,
                s.Metadata,
                RatingCount = s.Ratings.Count,
                AverageRating = s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)
            })
            .ToListAsync(ct);

        var commentsReceived = await db.Comments
            .AsNoTracking()
            .Where(c => distinctIds.Contains(c.SeaLion.UserId))
            .GroupBy(c => c.SeaLion.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var ratingsReceived = await db.Ratings
            .AsNoTracking()
            .Where(r => distinctIds.Contains(r.SeaLion.UserId))
            .GroupBy(r => r.SeaLion.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var commentsGiven = await db.Comments
            .AsNoTracking()
            .Where(c => distinctIds.Contains(c.UserId))
            .GroupBy(c => c.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var ratingsGiven = await db.Ratings
            .AsNoTracking()
            .Where(r => distinctIds.Contains(r.UserId))
            .GroupBy(r => r.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var result = new Dictionary<Guid, UserBadgeData>(distinctIds.Count);

        foreach (var userId in distinctIds)
        {
            var userSeals = sealRows.Where(s => s.UserId == userId).ToList();
            var userSealIds = userSeals.Select(s => s.Id).ToHashSet();
            var legendaryCount = userSeals.Count(s =>
                string.Equals(s.Metadata.Quality, "legendary", StringComparison.OrdinalIgnoreCase));
            var firstSeal = userSeals
                .OrderBy(s => s.CreatedAt)
                .ThenBy(s => s.Id)
                .FirstOrDefault();

            result[userId] = new UserBadgeData(
                userSeals.Count,
                legendaryCount,
                commentsReceived.GetValueOrDefault(userId),
                ratingsReceived.GetValueOrDefault(userId),
                commentsGiven.GetValueOrDefault(userId),
                ratingsGiven.GetValueOrDefault(userId),
                firstSeal?.Id,
                userSeals.Any(s => BadgeRules.IsPopularSeal(s.AverageRating, s.RatingCount)),
                userSealIds.Overlaps(topWeekSealIds),
                userSealIds.Overlaps(hallOfFameSealIds));
        }

        return result;
    }

    public async Task<IReadOnlyList<SeaLionDto>> ApplySealBadgesAsync(
        IReadOnlyList<SeaLionDto> items,
        CancellationToken ct)
    {
        if (items.Count == 0)
            return items;

        var userIds = items.Select(i => i.UserId).Distinct().ToList();
        var batch = await GetBatchAsync(userIds, ct);
        var topWeekSealIds = await GetTopSealIdsAsync(SeaLionTopPeriods.Week, ct);
        var hallOfFameSealIds = await GetTopSealIdsAsync(SeaLionTopPeriods.All, ct);

        return items
            .Select(item => item with
            {
                Badges = BadgeResolver.ForSeal(
                    batch.GetValueOrDefault(item.UserId, UserBadgeData.Empty),
                    item.Id,
                    item.AverageRating,
                    item.RatingCount,
                    topWeekSealIds,
                    hallOfFameSealIds)
            })
            .ToList();
    }

    private async Task<HashSet<Guid>> GetTopSealIdsAsync(string period, CancellationToken ct)
    {
        var query = db.SeaLions.AsNoTracking().AsQueryable();

        if (string.Equals(period, SeaLionTopPeriods.Week, StringComparison.OrdinalIgnoreCase))
        {
            var since = DateTime.UtcNow.AddDays(-7);
            query = query.Where(s => s.CreatedAt >= since);
        }

        var ids = await query
            .Where(s => s.Ratings.Count >= BadgeRules.TopMinRatings)
            .OrderByDescending(s => s.Ratings.Average(r => (double)r.Value))
            .ThenByDescending(s => s.Ratings.Count)
            .ThenByDescending(s => s.CreatedAt)
            .Take(BadgeRules.TopListLimit)
            .Select(s => s.Id)
            .ToListAsync(ct);

        return ids.ToHashSet();
    }
}
