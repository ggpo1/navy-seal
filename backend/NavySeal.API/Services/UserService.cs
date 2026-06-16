using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;

namespace NavySeal.API.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserSearchResultDto>> SearchAsync(string query, int limit, CancellationToken ct);
    Task<PublicUserProfileDto?> GetPublicProfileAsync(string username, CancellationToken ct);
}

public class UserService(AppDbContext db, IBadgeService badgeService) : IUserService
{
    public async Task<IReadOnlyList<UserSearchResultDto>> SearchAsync(string query, int limit, CancellationToken ct)
    {
        var normalized = UsernameValidator.Normalize(query);
        if (normalized.Length < 2)
            return [];

        var clampedLimit = Math.Clamp(limit, 1, 20);

        return await db.Users
            .AsNoTracking()
            .Where(u => EF.Functions.ILike(u.Username, $"{normalized}%"))
            .OrderBy(u => u.Username)
            .Take(clampedLimit)
            .Select(u => new UserSearchResultDto(
                u.Id,
                u.Username,
                u.SeaLions.Count))
            .ToListAsync(ct);
    }

    public async Task<PublicUserProfileDto?> GetPublicProfileAsync(string username, CancellationToken ct)
    {
        var normalized = UsernameValidator.Normalize(username);
        if (string.IsNullOrWhiteSpace(normalized))
            return null;

        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == normalized, ct);

        if (user is null)
            return null;

        var seals = await db.SeaLions
            .AsNoTracking()
            .Where(s => s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.UserId,
                Username = user.Username,
                s.Metadata,
                s.CreatedAt,
                RatingCount = s.Ratings.Count,
                CommentCount = s.Comments.Count,
                AverageRating = s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)
            })
            .ToListAsync(ct);

        var sealDtos = seals
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

        var enrichedSeals = await badgeService.ApplySealBadgesAsync(sealDtos, ct);
        var badgeData = await badgeService.GetUserDataAsync(user.Id, ct);

        return new PublicUserProfileDto(
            user.Id,
            user.Username,
            user.CreatedAt,
            enrichedSeals.Count,
            BadgeResolver.ForUser(badgeData),
            enrichedSeals);
    }
}
